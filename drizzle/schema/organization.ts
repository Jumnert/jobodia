import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { organizationUserSettingsTable } from "./organizationUserSettings";
import { relations } from "drizzle-orm";
import { JobListingTable } from "./jobListing";

export const OrganizationTable = pgTable("organizations", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt,
});
export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    jobListing: many(JobListingTable),
    organizationUserSettings: many(organizationUserSettingsTable),
  }),
);
