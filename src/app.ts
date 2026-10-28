import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { env } from "./config/config";
import { projectsRoutes } from "./features/projects/projects.route";
import { mockRoutesRoutes } from "./features/mock-routes/mock-routes.route";
import { projectTokensRoutes } from "./features/project-tokens/project-tokens.route";
import { DomainError } from "./core/error";

export const app = new Elysia()
  .onError(({ error, status }) => {
    if (error instanceof DomainError) {
      return status(error.status, { message: error.message });
    }
    console.error(error);
    return status(500, { message: "Unable to complete the request." });
  })
  .use(
    cors({
      origin: env.frontendURL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .use(projectsRoutes)
  .use(mockRoutesRoutes)
  .use(projectTokensRoutes);
