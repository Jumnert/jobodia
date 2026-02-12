"use server";

import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";

export async function getUserResumeAction() {
  const { userId } = await getCurrentUser();
  if (userId == null) return null;

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}
