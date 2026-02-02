import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // <-- automatically loads .env.local into process.env

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
