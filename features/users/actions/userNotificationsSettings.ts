"use server";

import z from "zod";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { userNotificationSettingsSchema } from "./schema";
import { updateUserNotificationSettings as updateUserNotificationSettingsDb } from "@/features/users/db/userNotificationSettings";
import { revalidatePath } from "next/cache";

export async function updateUserNotificationSettings(
  unsafeData: z.infer<typeof userNotificationSettingsSchema>,
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    userNotificationSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }
  await updateUserNotificationSettingsDb(userId, data);
  revalidatePath("/user-settings/notifications");
  return {
    error: false,
    message: "Successfully updated your notifications settings",
  };
}
