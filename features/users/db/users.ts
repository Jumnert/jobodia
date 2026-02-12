import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache/users";

export async function insertUser(user: typeof UserTable.$inferInsert) {
  // 1. Try to insert or update by ID
  try {
    await db
      .insert(UserTable)
      .values(user)
      .onConflictDoUpdate({
        target: UserTable.id,
        set: {
          name: user.name,
          imageUrl: user.imageUrl,
          email: user.email,
          updatedAt: user.updatedAt,
        },
      });
  } catch (error: any) {
    // 2. If it fails because the email is already taken by another ID
    if (error.message?.includes("users_email_unique")) {
      await db
        .update(UserTable)
        .set({
          id: user.id, // Update the old record with the new Clerk ID
          name: user.name,
          imageUrl: user.imageUrl,
          updatedAt: user.updatedAt,
        })
        .where(eq(UserTable.email, user.email));
    } else {
      throw error;
    }
  }
  revalidateUserCache(user.id);
}

export async function updateUser(
  id: string,
  user: Partial<typeof UserTable.$inferInsert>,
) {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id));
  revalidateUserCache(id);
}

export async function deleteUser(id: string) {
  await db.delete(UserTable).where(eq(UserTable.id, id));
  revalidateUserCache(id);
}
