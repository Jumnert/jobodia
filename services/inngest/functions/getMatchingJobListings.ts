import z from "zod";
import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import Groq from "groq-sdk";

const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  wage: z.number().nullable(),
  wageInterval: z.enum(wageIntervals).nullable(),
  stateAbbreviation: z.string().nullable(),
  city: z.string().nullable(),
  experienceLevel: z.enum(experienceLevels),
  type: z.enum(jobListingTypes),
  locationRequirement: z.enum(locationRequirements),
});

export async function getMatchingJobListings(
  prompt: string,
  jobListings: z.infer<typeof listingSchema>[],
  {
    maxNumberOfJobs,
  }: {
    maxNumberOfJobs?: number;
  },
) {
  const NO_JOBS = "No jobs found";

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    return [];
  }

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are an expert at matching people with jobs based on their specific experience, and requirements. The provided user prompt will be a description that can include information about themselves as well what they are looking for in a job. ${
      maxNumberOfJobs
        ? `You are to return up to ${maxNumberOfJobs} jobs.`
        : "Return all jobs that match their requirements."
    } Return the jobs as a comma separated list of jobIds. If you cannot find any jobs that match the user prompt, return the text "${NO_JOBS}". Here is the JSON array of available job listings: ${JSON.stringify(
      jobListings.map((listing) =>
        listingSchema
          .transform((listing) => ({
            ...listing,
            wage: listing.wage ?? undefined,
            wageInterval: listing.wageInterval ?? undefined,
            city: listing.city ?? undefined,
            stateAbbreviation: listing.stateAbbreviation ?? undefined,
            locationRequirement: listing.locationRequirement ?? undefined,
          }))
          .parse(listing),
      ),
    )}`;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const lastMessage = chatCompletion.choices[0]?.message?.content;

    if (!lastMessage || lastMessage === NO_JOBS) return [];

    return lastMessage
      .split(",")
      .map((jobId) => jobId.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error matching job listings:", error);
    return [];
  }
}
