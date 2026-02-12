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
        .then(() => {
          router.refresh();
        })
        .catch((err) => {
          console.error("User sync failed:", err);
          toast.error("Failed to sync user data with database.");
        });
    }
  }, [user?.id, user?.fullName, user?.imageUrl, isLoaded, router]);

  return null;
}
