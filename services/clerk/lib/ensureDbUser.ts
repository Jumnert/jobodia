import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { insertUserWithOptions } from "@/features/users/db/users";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function ensureDbUser(userId: string) {
  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });

  if (existingUser) return existingUser;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  if (!primaryEmail) {
    throw new Error("No primary email found for Clerk user");
  }

  const now = new Date();

  await insertUserWithOptions(
    {
      id: clerkUser.id,
      name:
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        clerkUser.username ||
        "User",
      imageUrl: clerkUser.imageUrl,
      email: primaryEmail,
      createdAt: now,
      updatedAt: now,
    },
    { revalidate: false },
  );

  await insertUserNotificationSettings(
    { userId: clerkUser.id },
    { revalidate: false },
  );

  return (
    (await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
    })) ??
    (await db.query.UserTable.findFirst({
      where: eq(UserTable.email, primaryEmail),
    }))
  );
}
