import { config } from "dotenv";
import { fileURLToPath } from "node:url";

// Bun loads backend/.env; the root file supplies Docker's PostgreSQL settings.
config({
  path: [
    fileURLToPath(new URL("../../.env", import.meta.url)),
    fileURLToPath(new URL("../../../.env", import.meta.url)),
  ],
  quiet: true,
});

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. See backend/.env.example.`);
  return value;
}

function databaseURL(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = encodeURIComponent(required("POSTGRES_USER"));
  const password = encodeURIComponent(required("POSTGRES_PASSWORD"));
  const database = encodeURIComponent(required("POSTGRES_DB"));
  const host = process.env.POSTGRES_HOST || "localhost";
  const port = process.env.POSTGRES_PORT || "5432";
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

export const env = {
  databaseURL: databaseURL(),
  authSecret: required("BETTER_AUTH_SECRET"),
  authURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  frontendURL: process.env.FRONTEND_URL || "http://localhost:3000",
  port: Number(process.env.PORT || "3001"),
};

if (env.authSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
}
