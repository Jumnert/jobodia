"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUser } from "../actions/syncUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserSyncer() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      syncUser()
        .then((result) => {
          if (result.success) {
            router.refresh();
          } else if (result.error) {
            toast.error(`Sync failed: ${result.error}`);
          }
        })
        .catch((err) => {
          console.error("User sync failed:", err);
          toast.error("An unexpected error occurred during sync.");
        });
    }
  }, [user?.id, user?.fullName, user?.imageUrl, isLoaded, router]);

  return null;
}
