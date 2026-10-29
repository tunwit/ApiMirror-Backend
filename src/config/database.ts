import { createDatabase } from "@apimirror/database";
import { env } from "./config";

export const { db, pool } = createDatabase(env.databaseURL);
