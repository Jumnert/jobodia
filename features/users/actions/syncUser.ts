"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { insertUser } from "../db/users";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!user) return;

  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;

  if (!email) return;

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
}
