import { createRouteHandler } from "uploadthing/next";

import { customFileRouter } from "@/services/uploadThing/router";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: customFileRouter,

  // Apply an (optional) custom config:
  //   config: {
  //     isDev: true, // This makes UploadThing skip the callback during development
  //   },
});
