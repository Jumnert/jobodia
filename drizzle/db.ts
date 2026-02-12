import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/drizzle/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "WARNING: DATABASE_URL is not set in production. Database queries will fail.",
  );
}

// Clean the connection string for serverless compatibility
const cleanedUrl = databaseUrl?.replace(/&?channel_binding=require/, "") || "";

const sql = neon(cleanedUrl);
export const db = drizzle({ client: sql, schema });
