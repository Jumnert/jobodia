"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncOrganization } from "../actions/syncOrganization";

export function OrganizationSyncer() {
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      syncOrganization();
    }
  }, [organization?.id, organization?.name, organization?.imageUrl]);

  return null;
}
