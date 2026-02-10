"use server";

import z from "zod";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable, UserResumeTable } from "@/drizzle/schema";
import { insertJobListing } from "@/features/jobListings/db/jobListing";
import { newJobListingApplicationSchema } from "./schemas";
import { insertJobListingApplication } from "../db/jobListingsApplications";
import { inngest } from "@/services/inngest/client";

export async function createJobListingApplication(
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>,
) {
  const permissonError = {
    error: true,
    message: "You do not have permission to apply for this job listing",
  };
  const { userId } = await getCurrentUser();
  if (userId == null) return permissonError;
  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ]);
  if (userResume == null || jobListing == null) return permissonError;
  const { success, data } =
    newJobListingApplicationSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error processing your application",
    };
  await insertJobListingApplication({
    jobListingId,
    userId,
    ...data,
  });

  //TODO: AI Generation
  await inngest.send({
    name: "app/jobListingApplication.created",
    data: {
      jobListingId,
      userId,
    },
  });
  return {
    error: false,
    message: "Application submitted successfully",
  };
}
async function getPublicJobListing(id: string) {
  // "use cache"
  // cachetag(getjoblistingIdTag(id))
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published"),
    ),
    columns: { id: true },
  });
}
async function getUserResume(userId: string) {
  // "use cache"
  // cachetag(getjoblistingIdTag(id))
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
}
