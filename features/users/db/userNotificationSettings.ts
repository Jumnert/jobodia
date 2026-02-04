import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { UserNotificationSettingsTable } from "@/drizzle/schema/userNotificationSettings";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotificationSettings";

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert,
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
  revalidateUserNotificationSettingsCache(settings.userId);
}
