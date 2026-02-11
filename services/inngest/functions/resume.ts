import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { updateUserResume } from "@/features/users/db/userResumes";
import { extractText } from "unpdf";
import Groq from "groq-sdk";

declare const process: {
  env: {
    GROQ_API_KEY: string;
  };
};

export const createAiSummaryOfUploadResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-upload-resume",
    name: "Create AI Summary of Upload Resume",
  },
  {
    event: "app/resume.uploaded",
  },
  async ({ step, event }) => {
    const { id: userId } = event.user;

    const userResume = await step.run("get-user-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: {
          resumeFileUrl: true,
        },
      });
    });

    if (userResume == null) return;

    // Extract text from PDF
    const resumeText = await step.run("extract-pdf-text", async () => {
      const response = await fetch(userResume.resumeFileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { text } = await extractText(buffer);
      return text;
    });

    const result = await step.run("create-ai-summary", async () => {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Summarize the following resume and extract all key skills, experience, and qualifications. The summary should include the following information that a hiring manager would need to make a decision on whether to invite the candidate for an interview and determine if they are a good fit for this job. The summary should be in markdown format. Do not return other text. If the file does not look like a resume return the text N/A

Resume content:
${resumeText}`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      });

      return chatCompletion.choices[0]?.message?.content || "";
    });

    await step.run("save-ai-summary", async () => {
      if (!result) return;
      await updateUserResume(userId, { aiSummary: result });
    });
  },
);
