import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";

export async function upsertUserResume(
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, "userId">,
) {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: data,
    });
  // revalidateUserResumeCache(userId);
}
