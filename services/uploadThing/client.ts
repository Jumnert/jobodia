import { UTApi } from "uploadthing/server";

export const uploadThing = new UTApi({
  token: process.env.UPLOADTHING_SECRET,
});
