"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { JobListingStatus, JobListingTable } from "@/drizzle/schema";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type JobListings = Pick<typeof JobListingTable.$inferSelect, "title" | "id"> & {
  applicationCount: number;
};
export function JobListingMenuGroup({
  status,
  jobListings,
}: {
  status: JobListingStatus;
  jobListings: JobListings[];
}) {
  const { joblistingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          jobListings.find((job) => job.id === joblistingId) != null
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {jobListings.map((jobListing) => (
              <JobListingMenuItem key={jobListing.id} {...jobListing} />
            ))}
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
function JobListingMenuItem({ id, title, applicationCount }: JobListings) {
  const { jobListingId } = useParams();
  return (
    <SidebarMenuSub>
      <SidebarMenuSubButton isActive={jobListingId === id} asChild>
        <Link href={`/employer/job-listings/${id}`}>
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
      {applicationCount > 0 && (
        <div className="absolute right-2 top1/2 -translate-y-1/2 text-sm text-muted">
          {applicationCount}
        </div>
      )}
    </SidebarMenuSub>
  );
}
