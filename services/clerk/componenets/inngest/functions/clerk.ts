import { inngest } from "../client";

export const clerkCreateUser = inngest.createFunction(
  { id: "clerk/create-db-user", name: "Clerk - Create DB User" },
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

    // Wait for user to be created in database before creating notification settings

    await step.run("create-user-notification-settings", async () => {
      await insertUserNotificationSettings({ userId });
    });
  },
);

export const clerkDeleteUser = inngest.createFunction(
  {
    id: "clerk/delete-db-user",
    name: "Clerk - delete DB user",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });

    const userId = (event.data.data as { id: string }).id;

    await step.run("delete-user", async () => {
      // Delete user and cascade delete related data via foreign keys
      await db.delete(UserTable).where(eq(UserTable.id, userId));
    });
  },
);
