import { AppSideBar } from "@/components/sidebar/AppSideBar";
import SideBarNavMenuGroup from "@/components/sidebar/SideBarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { SidebarOrganizationButton } from "@/features/organizations/components/sidebarOrganizationButton";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

export default function EmployeerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSideBar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listing</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing" asChild>
              <Link href="/employer/job-listing/new">
                <PlusIcon /> <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
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
