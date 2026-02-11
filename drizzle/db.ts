import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";
declare const process: {
  env: {
    DATABASE_URL: string;
  };
};
export const db = drizzle(process.env.DATABASE_URL, { schema });
