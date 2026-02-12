"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { insertOrganization } from "@/features/organizations/db/users";
import { revalidatePath } from "next/cache";

export async function syncOrganization() {
  try {
    const { orgId } = await auth();
    if (!orgId) return;

    const client = await clerkClient();
    const organization = await client.organizations.getOrganization({
      organizationId: orgId,
    });

    if (!organization) {
      console.error(
        "syncOrganization: Clerk organization not found for ID:",
        orgId,
      );
      return;
    }

    await insertOrganization({
      id: organization.id,
      name: organization.name,
      imageUrl: organization.imageUrl,
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/employer");
  } catch (error) {
    console.error("syncOrganization: Database or Clerk error:", error);
    throw error;
  }
}
