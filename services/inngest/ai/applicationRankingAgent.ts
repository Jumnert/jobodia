import { updateJobListingApplication } from "@/features/jobListingApplication/db/jobListingsApplications";
import { createAgent, createTool, openai } from "@inngest/agent-kit";
import z from "zod";

const saveApplicationRatingTool = createTool({
  name: "save_application_rating",
  description: "Save the application rating to the database",
  parameters: z.object({
    rating: z.number().int().max(5).min(1),
    jobListingId: z.string(),
    userId: z.string(),
  }),
  handler: async ({ jobListingId, rating, userId }) => {
    await updateJobListingApplication({ jobListingId, userId }, { rating });
    return "Sucessfully saved application ranking score";
  },
});

export const applicationRankingAgent = createAgent({
  name: "Application Ranking Agent",
  description:
    "You are an AI agent that ranks job applications based on the job listing and the resume of the applicant.",
  system:
    "You are an expert at ranking job applicants for specific jobs based on their resume and cover letter. You will be provided with a JSON prompt containing: userId, jobListingId, resumeSummary, coverLetter, and jobListing details. Your task is to compare the job listing with the applicant's resume and cover letter and provide a rating for the applicant on how well they fit that specific job listing. The rating should be a number between 1 and 5, where 5 is the highest rating (perfect match) and 1 is the lowest (no match). USE THE PROVIDED userId AND jobListingId FROM THE INPUT JSON. DO NOT GUESS OR INVENT IDs. You should save this user rating in the database using the 'save_application_rating' tool and then stop. DO NOT provide any other text response or reasoning.",
  tools: [saveApplicationRatingTool],
  model: openai({
    model: "openrouter/auto",
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: "https://openrouter.ai/api/v1",
  }),
});
