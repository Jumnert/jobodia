"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncOrganization } from "../actions/syncOrganization";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrganizationSyncer() {
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      syncOrganization()
        .then(() => {
          router.refresh();
        })
        .catch((err) => {
          console.error("Organization sync failed:", err);
          toast.error("Failed to sync organization data.");
        });
    }
  }, [organization?.id, organization?.name, organization?.imageUrl, router]);

  return null;
}
