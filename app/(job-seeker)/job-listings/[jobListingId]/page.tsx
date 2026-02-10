import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { JobListingItems } from "../../_shared/JobListingItems";
import { IsBreakpoint } from "@/components/isBreakpoint";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClientSheet } from "./_ClientSheet";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges";
import { MarkDownRenderer } from "@/components/markdown/MarkDownRenderer";

export default function JobListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <>
      {/* Desktop: Resizable panels */}

      <ResizablePanelGroup
        orientation="horizontal"
        className="max-lg:hidden h-screen"
      >
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="p-4 overflow-y-auto h-full">
            <JobListingItems searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="mx-2" />

        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="p-4 overflow-y-auto h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <JobListingDetails params={params} searchParams={searchParams} />
            </Suspense>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Mobile: Job list + Sheet */}
      <div className="lg:hidden">
        <div className="p-4 h-screen overflow-y-auto">
          <JobListingItems searchParams={searchParams} params={params} />
        </div>

        <ClientSheet>
          <SheetContent showCloseButton={false} className="p-4 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Job Listing Details</SheetTitle>
            </SheetHeader>
            <Suspense fallback={<LoadingSpinner />}>
              <JobListingDetails searchParams={searchParams} params={params} />
            </Suspense>
          </SheetContent>
        </ClientSheet>
      </div>
    </>
  );
}
async function JobListingDetails({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { jobListingId } = await params;
  if (!jobListingId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a job listing to view details
      </div>
    );
  }

  const jobListing = await getJobListing(jobListingId);
  if (jobListing == null) return notFound();
  const nameInitials = jobListing.organization?.name
    .split(" ")
    .splice(0, 4)
    .map((word) => word[0])
    .join("");

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/?${convertSearchParamsToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        {/*todo: apply button */}
      </div>
      <MarkDownRenderer source={jobListing.description} />
    </div>
  );
}
async function getJobListing(id: string) {
  //   "use cache"
  //   cacheTag(getJobListingIdTag(id))

  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });
  //   if (listing != null) {
  //     cacheTag(getOrganizationIdTag(listing.organization.id));
  //   }
  return listing;
}
