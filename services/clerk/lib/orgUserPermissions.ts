import { auth } from "@clerk/nextjs/server";

type UserPermission =
  | "org:create_job_listings:job_listings_create"
  | "org:create_job_listings:job_listings_update"
  | "org:create_job_listings:job_listing_delete"
  | "org:create_job_listings:job_listings_change_status"
  | "org:job_listing_applicant:applicant_change_rating"
  | "org:job_listing_applicant:applicant_change_stage";

export async function hasOrgUserPermission(permission: UserPermission) {
  const { has } = await auth();
  return has({ permission });
}
