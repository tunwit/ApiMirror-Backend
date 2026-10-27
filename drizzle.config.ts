import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.databaseURL },
});
