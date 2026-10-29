import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { env } from "./config/config";
import { projectsRoutes } from "./features/projects/projects.route";
import { mockRoutesRoutes } from "./features/mock-routes/mock-routes.route";
import { projectTokensRoutes } from "./features/project-tokens/project-tokens.route";
import { handleError } from "./core/error-handler";

export const app = new Elysia()
  .onError(handleError)
  .use(
    cors({
      origin: env.frontendURL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .get("/", () => "ApiMirror Backend")
  .use(projectsRoutes)
  .use(mockRoutesRoutes)
  .use(projectTokensRoutes);
