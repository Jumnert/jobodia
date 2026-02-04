import { NonRetriableError } from "inngest";
import { inngest } from "../client";

import { Webhook } from "svix";
import { deleteUser, insertUser, updateUser } from "@/features/users/db/users";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";

function verifyWebHook({
  raw,
  headers,
}: {
  raw: string;
  headers: Record<string, string>;
}) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is missing");
  }

  return new Webhook(secret).verify(raw, headers);
}

export const clerkCreateUser = inngest.createFunction(
  {
    id: "clerk/create-db-user",
    name: "Clerk - create DB user",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });
    const userId = await step.run("create-user", async () => {
      const userData = event.data.data;
      const email = userData.email_addresses.find(
        (email) => email.id === userData.primary_email_address_id,
      );

      if (!email) {
        throw new NonRetriableError("Not Primary Email Found");
      }

      await insertUser({
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        email: email.email_address,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      });
      return userData.id;
    });

    await step.run("create-user-notification-settings", async () => {
      await insertUserNotificationSettings({ userId });
    });
  },
);
export const clerkDeleteUser = inngest.createFunction(
  { id: "clerk/delete-db-user", name: "Clerk - Delete DB User" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });

    await step.run("delete-user", async () => {
      const { id } = event.data.data;

      if (id == null) {
        throw new NonRetriableError("No ID Found");
      }
      await deleteUser(id);
    });
  },
);

export const clerkUpdateUser = inngest.createFunction(
  {
    id: "clerk-db-update-user",
    name: "Clerk - Update DB User",
  },
  {
    event: "clerk/user.updated", // <-- this is the missing 2nd argument
  },
  async ({ event, step }) => {
    // <-- handler
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });

    await step.run("update-user", async () => {
      const userData = event.data.data;
      const email = userData.email_addresses?.find(
        (email) => email.id === userData.primary_email_address_id,
      );

      if (!email) {
        throw new NonRetriableError("No primary email found");
      }

      await updateUser(userData.id, {
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        email: email.email_address,
        updatedAt: new Date(userData.updated_at),
      });
    });
  },
);
