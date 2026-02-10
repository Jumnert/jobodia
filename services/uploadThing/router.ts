import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import { inngest } from "../inngest/client";
import { upsertUserResume } from "@/features/users/db/userResumes";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { uploadThing } from "./client";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const customFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    {
      awaitServerData: true,
    },
  )
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (userId == null) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const { userId } = metadata;
        console.log("Upload complete for user:", userId, "File:", file.ufsUrl);

        const resumeFileKey = await getUserResumeFileKey(userId);

        await upsertUserResume(userId, {
          resumeFileUrl: file.ufsUrl,
          resumeFileKey: file.key,
        });

        if (resumeFileKey) {
          console.log("Deleting old resume:", resumeFileKey);
          await uploadThing.deleteFiles(resumeFileKey).catch((err) => {
            console.error("Failed to delete old resume:", err);
          });
        }

        console.log("Sending to Inngest...");
        await inngest
          .send({
            name: "app/resume.uploaded",
            user: { id: userId },
          })
          .catch((err) => {
            console.error("Failed to send to Inngest:", err);
          });

        return { message: "Resume uploaded successfully" } as const;
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type customFileRouter = typeof customFileRouter;
async function getUserResumeFileKey(userId: string) {
  try {
    const data = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, userId),
      columns: {
        resumeFileKey: true,
      },
    });
    return data?.resumeFileKey;
  } catch (error) {
    console.error("Error fetching user resume key:", error);
    return null;
  }
}
