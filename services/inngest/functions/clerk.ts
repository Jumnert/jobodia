import { NonRetriableError } from "inngest";
import { inngest } from "../client";

import { Webhook } from "svix";
import { deleteUser, insertUser, updateUser } from "@/features/users/db/users";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";
import {
  insertOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/features/organizations/db/users";

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
export const clerkCreateOrganization = inngest.createFunction(
  {
    id: "clerk/create-db-organization",
    name: "Clerk - create DB organization",
  },
  {
    event: "clerk/organization.created",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });
    await step.run("create-organization", async () => {
      const orgData = event.data.data;

      console.log("Organization payload:", JSON.stringify(orgData, null, 2));

      if (!orgData.id || !orgData.name) {
        throw new NonRetriableError(
          `Missing required organization fields: id=${orgData.id}, name=${orgData.name}`,
        );
      }

      console.log("Creating organization:", {
        id: orgData.id,
        name: orgData.name,
        imageUrl: orgData.image_url,
        createdAt: orgData.created_at,
        updatedAt: orgData.updated_at,
      });

      await insertOrganization({
        id: orgData.id,
        name: orgData.name,
        imageUrl: orgData.image_url || null,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date(orgData.updated_at),
      });

      console.log("Organization created successfully:", orgData.id);
    });
  },
);

export const clerkUpdateOrganization = inngest.createFunction(
  {
    id: "clerk/update-db-organization",
    name: "Clerk - update DB organization",
  },
  {
    event: "clerk/organization.updated",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });
    await step.run("update-organization", async () => {
      const orgData = event.data.data;

      console.log(
        "Organization update payload:",
        JSON.stringify(orgData, null, 2),
      );

      if (!orgData.id) {
        throw new NonRetriableError(`Missing required organization field: id`);
      }

      console.log("Updating organization:", {
        id: orgData.id,
        name: orgData.name,
        imageUrl: orgData.image_url,
        updatedAt: orgData.updated_at,
      });

      await updateOrganization(orgData.id, {
        name: orgData.name,
        imageUrl: orgData.image_url || null,
        updatedAt: new Date(orgData.updated_at),
      });

      console.log("Organization updated successfully:", orgData.id);
    });
  },
);

export const clerkDeleteOrganization = inngest.createFunction(
  {
    id: "clerk/delete-db-organization",
    name: "Clerk - delete DB organization",
  },
  {
    event: "clerk/organization.deleted",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebHook(event.data);
      } catch {
        throw new NonRetriableError("invalid webhook");
      }
    });
    await step.run("delete-organization", async () => {
      const orgData = event.data.data;

      console.log(
        "Organization delete payload:",
        JSON.stringify(orgData, null, 2),
      );

      const orgId = orgData.id;

      if (!orgId) {
        throw new NonRetriableError(`Missing required organization field: id`);
      }

      console.log("Deleting organization:", orgId);

      await deleteOrganization(orgId);

      console.log("Organization deleted successfully:", orgId);
    });
  },
);
// export const clerkDeleteUser = inngest.createFunction(
//   { id: "clerk/delete-db-user", name: "Clerk - Delete DB User" },
//   { event: "clerk/user.deleted" },
//   async ({ event, step }) => {
//     await step.run("verify-webhook", async () => {
//       try {
//         verifyWebHook(event.data);
//       } catch {
//         throw new NonRetriableError("invalid webhook");
//       }
//     });

//     await step.run("delete-user", async () => {
//       const { id } = event.data.data;

//       if (id == null) {
//         throw new NonRetriableError("No ID Found");
//       }
//       await deleteUser(id);
//     });
//   },
// );

// export const clerkUpdateUser = inngest.createFunction(
//   {
//     id: "clerk-db-update-user",
//     name: "Clerk - Update DB User",
//   },
//   {
//     event: "clerk/user.updated", // <-- this is the missing 2nd argument
//   },
//   async ({ event, step }) => {
//     // <-- handler
//     await step.run("verify-webhook", async () => {
//       try {
//         verifyWebHook(event.data);
//       } catch {
//         throw new NonRetriableError("invalid webhook");
//       }
//     });

//     await step.run("update-user", async () => {
//       const userData = event.data.data;
//       const email = userData.email_addresses?.find(
//         (email) => email.id === userData.primary_email_address_id,
//       );

//       if (!email) {
//         throw new NonRetriableError("No primary email found");
//       }

//       await updateUser(userData.id, {
//         name: `${userData.first_name} ${userData.last_name}`,
//         imageUrl: userData.image_url,
//         email: email.email_address,
//         updatedAt: new Date(userData.updated_at),
//       });
//     });
//   },
// );
