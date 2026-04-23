import { db } from "@/drizzle/db";
import { OrganizationTable, UserTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ensureDbUser } from "./ensureDbUser";
// import { cacheTag } from "next/cache";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();
  const user =
    allData && userId != null
      ? await getUser(userId).then(async (existingUser) => {
          if (existingUser) return existingUser;

          try {
            return await ensureDbUser(userId);
          } catch (error) {
            console.error("Failed to ensure DB user exists:", error);
            return null;
          }
        })
      : undefined;

  return {
    userId,
    user,
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
