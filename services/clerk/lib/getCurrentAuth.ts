import { db } from "@/drizzle/db";
import { OrganizationTable, UserTable } from "@/drizzle/schema";
import {
  getUserGlobalTag,
  getUserIdTag,
} from "@/features/users/db/cache/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
// import { cacheTag } from "next/cache";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

export async function getCurrentOrganization({ allData = false } = {}) {
  const { orgId } = await auth();

  return {
    orgId,
    organization:
      allData && orgId != null ? await getOrganization(orgId) : undefined,
  };
}

async function getUser(id: string) {
  try {
    return await db.query.UserTable.findFirst({
      where: eq(UserTable.id, id),
    });
  } catch (error) {
    console.error("Database error in getUser:", error);
    return null;
  }
}

async function getOrganization(id: string) {
  try {
    return await db.query.OrganizationTable.findFirst({
      where: eq(OrganizationTable.id, id),
    });
  } catch (error) {
    console.error("Database error in getOrganization:", error);
    return null;
  }
}
