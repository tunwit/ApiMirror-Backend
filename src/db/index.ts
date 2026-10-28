import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/config";
import * as schema from "./schema";

export const pool = new Pool({
  connectionString: env.databaseURL,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
