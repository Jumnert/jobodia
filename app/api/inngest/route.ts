import { inngest } from "@/services/inngest/client";
import {
  clerkCreateOrganization,
  clerkCreateUser,
  clerkDeleteUser,
  clerkUpdateUser,
  clerkUpdateOrganization,
  clerkDeleteOrganization,
} from "@/services/inngest/functions/clerk";
import { createAiSummaryOfUploadResume } from "@/services/inngest/functions/resume";
import { rankApplication } from "@/services/inngest/functions/jobListingApplication";
import { serve } from "inngest/next";
import {
  prepareDailyUserJobListingNotifications,
  sendDailyUserJobListingEmail,
} from "@/services/inngest/functions/email";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkDeleteUser,
    clerkUpdateUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    createAiSummaryOfUploadResume,
    rankApplication,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
  ],
});
