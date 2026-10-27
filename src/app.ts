import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { env } from "./config/config";

export const app = new Elysia()
  .use(
    cors({
      origin: env.frontendURL,
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler);
