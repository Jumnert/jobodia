"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUser } from "../actions/syncUser";

export function UserSyncer() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [user?.id, user?.fullName, user?.imageUrl, isLoaded]);

  return null;
}
