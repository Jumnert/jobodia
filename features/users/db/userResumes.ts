import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function upsertUserResume(
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, "userId">,
) {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: {
        ...data,
        aiSummary: null, // Clear old summary when new file is uploaded
      },
    });
  revalidatePath("/user-settings/resume");
}
export async function updateUserResume(
  userId: string,
  data: Partial<Omit<typeof UserResumeTable.$inferInsert, "userId">>,
) {
  await db
    .update(UserResumeTable)
    .set(data)
    .where(eq(UserResumeTable.userId, userId));

  revalidatePath("/user-settings/resume");
}
