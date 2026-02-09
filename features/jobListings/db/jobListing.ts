import { db } from "@/drizzle/db";
import { JobListingTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

export async function updateJobListing(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>,
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  // revalidateJobListingCache(updatedListing);

  return updatedListing;
}
export async function deleteJobListing(id: string) {
  const [deleteJobListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });
  //revalidatejoblistincahce(deleteJobListing)
  return deleteJobListing;
}
