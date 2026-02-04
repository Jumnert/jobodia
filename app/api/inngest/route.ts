import { inngest } from "@/services/clerk/componenets/inngest/client";
import {
  clerkCreateUser,
  clerkDeleteUser,
  clerkUpdateUser,
} from "@/services/clerk/componenets/inngest/functions/clerk";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    clerkCreateUser,
    clerkDeleteUser,
    clerkUpdateUser,
  ],
});
