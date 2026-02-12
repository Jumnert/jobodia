"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { insertUser } from "../db/users";
import { revalidatePath } from "next/cache";

export async function syncUser(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: true };

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return { success: false, error: "Clerk user not found" };
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    if (!email) {
      return { success: false, error: "No primary email found" };
    }

    await insertUser({
      id: user.id,
      name:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        user.username ||
        "User",
      imageUrl: user.imageUrl,
      email: email,
      updatedAt: new Date(),
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("syncUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
