import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/config";
import config from "./drizzle.config.json";

export default defineConfig({
  schema: config.schema,
  out: config.out,
  dialect: config.dialect as "postgresql",
  dbCredentials: { url: env.databaseURL },
});
