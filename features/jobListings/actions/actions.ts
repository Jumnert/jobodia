"use server";

import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { error } from "console";
import { redirect } from "next/navigation";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
} from "../db/jobListing";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>,
) {
  const { orgId } = await getCurrentOrganization();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:create_job_listings:job_listings_create"))
  ) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }
  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error create your job listing",
    };
  }
  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>,
) {
  const { orgId } = await getCurrentOrganization();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:create_job_listings:job_listings_update"))
  ) {
    return {
      error: true,
      message: "You don't have permission to update a job listing",
    };
  }
  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error update your job listing",
    };
  }

  const jobListing = getJobListing(id, orgId);

  if (jobListing == null) {
    return {
      error: true,
      message: "There was an error update your job listing",
    };
  }
  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

async function getJobListing(id: string, orgId: string) {
  //   "use cache"
  // cacheTag(getJobListingIdTag(id))

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
}
