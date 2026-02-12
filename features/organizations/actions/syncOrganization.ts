"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { insertOrganization } from "@/features/organizations/db/users";
import { revalidatePath } from "next/cache";

export async function syncOrganization() {
  const { orgId } = await auth();
  if (!orgId) return;

  const client = await clerkClient();
  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  });

  if (!organization) return;

  await insertOrganization({
    id: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl,
    updatedAt: new Date(),
  });

  revalidatePath("/");
  revalidatePath("/employer");
}
