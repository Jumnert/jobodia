import { Badge } from "@/components/ui/badge";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { getJobListingsIdTag } from "@/features/jobListings/db/cache/jobListing";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { id } from "zod/locales";

type Props = {
  params: Promise<{ jobListingId: string }>;
};
export default async function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}
async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) {
    return null;
  }
  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) return notFound();

  return (
    <div className="space-y-6 max-w-6xl max-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4l:flex-col @max-4xl:items-start">
        <div className="text-2xl font-bold tracking-tight">
          <h1>{jobListing.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="rounded-lg">
              {formatJobListingStatus(jobListing.status)}
            </Badge>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
}

async function getJobListing(id: string, orgId: string) {
  // "use cache"
  // cacheTag(getJobListingsIdTag(id))

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
}
