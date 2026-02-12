import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/drizzle/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "WARNING: DATABASE_URL is not set in production. Database queries will fail.",
  );
}

const sql = neon(databaseUrl || "");
export const db = drizzle({ client: sql, schema });
