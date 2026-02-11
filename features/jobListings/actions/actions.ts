"use server";

import z from "zod";
import { jobListingAiSearchFormSchema, jobListingSchema } from "./schemas";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { error } from "console";
import { redirect } from "next/navigation";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb,
} from "../db/jobListing";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/planFeatureHelpers";
import { cacheTag } from "next/cache";
import { getJobListingsGlobalTag } from "../db/cache/jobListing";
import { getMatchingJobListings } from "@/services/inngest/functions/getMatchingJobListings";

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

  const jobListing = await getJobListing(id, orgId);

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

export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to update a job listing status",
  };
  const { orgId } = await getCurrentOrganization();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:create_job_listings:job_listings_update"))
  ) {
    return error;
  }

  const jobListing = await getJobListing(id, orgId);

  if (jobListing == null) return error;
  const newStatus = getNextJobListingStatus(jobListing.status);
  if (
    !(await hasOrgUserPermission(
      "org:create_job_listings:job_listings_change_status",
    )) ||
    (newStatus == "published" && (await hasReachedMaxPublishedJobListings()))
  )
    return error;
  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    postedAt:
      newStatus === "published" && jobListing.postedAt === null
        ? new Date()
        : undefined,
  });
  return {
    error: false,
  };
}
export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message:
      "You don't have permission to update a job listing's featured status ",
  };
  const { orgId } = await getCurrentOrganization();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:create_job_listings:job_listings_update"))
  ) {
    return error;
  }

  const jobListing = await getJobListing(id, orgId);

  if (jobListing == null) return error;
  const newFeaturedStatus = !jobListing.isFeatured;
  if (
    !(await hasOrgUserPermission(
      "org:create_job_listings:job_listings_change_status",
    )) ||
    (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
  )
    return error;
  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });
  return {
    error: false,
  };
}
export async function deleteJobListing(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to delete a job listing",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  if (
    !(await hasOrgUserPermission("org:create_job_listings:job_listing_delete"))
  ) {
    return error;
  }

  await deleteJobListingDb(id);
  redirect("/employer");
}

export async function getAiJobListingSearchResults(
  unsafe: z.infer<typeof jobListingAiSearchFormSchema>,
): Promise<
  { error: true; message?: string } | { error: false; jobIds: string[] }
> {
  const { success, data } = jobListingAiSearchFormSchema.safeParse(unsafe);
  if (!success) {
    return {
      error: true,
      message: "There was an error getting your job listing search results",
    };
  }
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You need an account to use AI Search",
    };
  }
  const allListings = await getPublicJobListings();
  const matchingListings = await getMatchingJobListings(
    data.query,
    allListings,
    {
      maxNumberOfJobs: 10,
    },
  );
  if (matchingListings.length === 0)
    return {
      error: true,
      message: "No job Matching your criteria",
    };
  return {
    error: false,
    jobIds: matchingListings,
  };
}

async function getPublicJobListings() {
  // "use cache";
  // cacheTag(getJobListingsGlobalTag());
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
  });
}
