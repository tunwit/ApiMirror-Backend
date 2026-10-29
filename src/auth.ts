import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { env } from "./config/config";
import { db } from "./config/database";
import * as schema from "@apimirror/database/schema";

export const auth = betterAuth({
  appName: "ApiMirror",
  baseURL: env.authURL,
  secret: env.authSecret,
  trustedOrigins: [env.frontendURL],
  advanced: {
    disableOriginCheck: false,
    disableCSRFCheck: false,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [username()],
});

export type Session = typeof auth.$Infer.Session;
