import { db } from "@/drizzle/db";
import { JobListingTable, UserTable } from "@/drizzle/schema";

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert,
) {
  const [newListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });
  //   revalidateUserCache(newListing);
  return newListing;
}
