import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { SidebarUserButtonClient } from "./_SidebarUserButtonClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@/services/clerk/componenets/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export function SidebarUserButton() {
  return (
    <Suspense>
      <SideBarUserSuspense />
    </Suspense>
  );
}
async function SideBarUserSuspense() {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  // If we have a userId but no DB user, pass a placeholder
  // The client-side hook in SidebarUserButtonClient will show the real data
  const displayUser = user ?? {
    name: "Loading...",
    email: "",
    imageUrl: "",
  };

  return <SidebarUserButtonClient user={displayUser} />;
}
