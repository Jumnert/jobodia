import { AsyncIf } from "@/components/AsyncIf";
import { AppSideBar } from "@/components/sidebar/AppSideBar";
import SideBarNavMenuGroup from "@/components/sidebar/SideBarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { db } from "@/drizzle/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/drizzle/schema";
import { getJobListingApplicationJobListingTag } from "@/features/jobListingApplication/db/cache/jobListingApplciations";
import { getJobListingsOrganizationTag } from "@/features/jobListings/db/cache/jobListing";
import {
  getNextJobListingStatus,
  sortJobListingsByStatus,
} from "@/features/jobListings/lib/utils";
import { SidebarOrganizationButton } from "@/features/organizations/components/sidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { count, desc, eq } from "drizzle-orm";
import { ClipboardListIcon, Key, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { object } from "zod";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";

import { OrganizationSyncer } from "@/features/organizations/components/OrganizationSyncer";

export default function EmployeerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <LayoutSuspense>
        <OrganizationSyncer />
        {children}
      </LayoutSuspense>
    </Suspense>
  );
}
async function LayoutSuspense({ children }: { children: React.ReactNode }) {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return redirect("/organizations/select");
  return (
    <AppSideBar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listing</SidebarGroupLabel>
            <AsyncIf
              condition={() =>
                hasOrgUserPermission(
                  "org:create_job_listings:job_listings_create",
                )
              }
            >
              {" "}
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                {" "}
                <JobListingMenu orgId={orgId} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
          <SideBarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSideBar>
  );
}
async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId);
  if (
    jobListings.length == 0 &&
    (await hasOrgUserPermission("org:create_job_listings:job_listings_create"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span>Create Your first Joblisting</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus,
      );
    })
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ));
}

async function getJobListings(orgId: string) {
  // "use cache";
  // cacheTag(getJobListingsOrganizationTag(orgId));
  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId),
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  // data.forEach((jobListing) => {
  //   cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  // });

  return data;
}
