import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@/services/clerk/componenets/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { SidebarOrganizationButtonClient } from "./_SidebarOrganizationButtonClient";

export function SidebarOrganizationButton() {
  return (
    <Suspense>
      <SideBarOrganizationSuspense />
    </Suspense>
  );
}
async function SideBarOrganizationSuspense() {
  const [{ user }, { orgId, organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);

  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  // If we have an orgId but no DB organization, pass a placeholder
  // The client-side useClerk() hook will fill in the real data
  const displayOrg =
    organization ?? (orgId ? { name: "Loading...", imageUrl: null } : null);

  if (displayOrg == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient user={user} organization={displayOrg} />
  );
}
