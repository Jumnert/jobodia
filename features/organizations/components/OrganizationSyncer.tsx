"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncOrganization } from "../actions/syncOrganization";
import { useRouter } from "next/navigation";

export function OrganizationSyncer() {
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      syncOrganization().then(() => {
        router.refresh();
      });
    }
  }, [organization?.id, organization?.name, organization?.imageUrl, router]);

  return null;
}
