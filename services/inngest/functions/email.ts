import { db } from "@/drizzle/db";
import { inngest } from "../client";
import {
  JobListingTable,
  UserNotificationSettingsTable,
} from "@/drizzle/schema";
import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { GetEvents } from "inngest";
import { getMatchingJobListings } from "./getMatchingJobListings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/DailyJobListingEmail";

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: "prepare-daily-user-job-listing-notifications",
    name: "Prepare Daily User Job Listing Notifications",
  },
  {
    cron: "TZ=Asia/Phnom_Penh 0 7 * * *",
  },
  async ({ step, event }) => {
    const getUsers = step.run("get-users", async () => {
      return await db.query.UserNotificationSettingsTable.findMany({
        where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
        columns: {
          userId: true,
          newJobEmailNotifications: true,
          aiPrompt: true,
        },
        with: {
          user: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
      });
    });
    const getJobListing = step.run("get-recent-job-listings", async () => {
      return db.query.JobListingTable.findMany({
        where: and(
          gte(
            JobListingTable.postedAt,
            subDays(new Date(event.ts ?? Date.now()), 1),
          ),
          eq(JobListingTable.status, "published"),
        ),
        columns: {
          createdAt: false,
          postedAt: false,
          updatedAt: false,
          status: false,
          organizationId: false,
        },
        with: {
          organization: {
            columns: { name: true },
          },
        },
      });
    });
    const [userNotifications, Joblistings] = await Promise.all([
      getUsers,
      getJobListing,
    ]);
    if (Joblistings.length === 0 || userNotifications.length === 0) return;
    const events = userNotifications.map((notification) => {
      return {
        name: "app/email.daily-user-job-listings",
        user: {
          email: notification.user.email,
          name: notification.user.name,
        },
        data: {
          aiPromtp: notification.aiPrompt ?? undefined,
          jobListings: Joblistings.map((listing) => {
            return {
              ...listing,
              organizationName: listing.organization.name,
            };
          }),
        },
      } as const satisfies GetEvents<
        typeof inngest
      >["app/email.daily-user-job-listings"];
    });
    await step.sendEvent("send-emails", events);
  },
);
export const sendDailyUserJobListingEmail = inngest.createFunction(
  {
    id: "send-daily-user-job-listing-email",
    name: "Send Daily User Job Listing Email",
    throttle: {
      limit: 10,
      period: "1m",
    },
  },
  { event: "app/email.daily-user-job-listings" },
  async ({ event, step }) => {
    const { jobListings, aiPromtp } = event.data;
    const user = event.user;

    if (jobListings.length === 0) return;

    let matchingJobListings: typeof jobListings = [];
    if (aiPromtp == null || aiPromtp.trim() === "") {
      matchingJobListings = jobListings;
    } else {
      const matchingIds = await getMatchingJobListings(aiPromtp, jobListings);
      matchingJobListings = jobListings.filter((listing) =>
        matchingIds.includes(listing.id),
      );
    }

    if (matchingJobListings.length === 0) return;

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "Jobodia <jobodia@resend.dev>",
        to: user.email,
        subject: "Daily Job Listings",
        react: DailyJobListingEmail({
          jobListings,
          userName: user.name,
          serverUrl: process.env.SERVER_URL || "http://localhost:3000",
        }),
      });
    });
  },
);
