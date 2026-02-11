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

import { serve } from "inngest/next";

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
  ],
});
