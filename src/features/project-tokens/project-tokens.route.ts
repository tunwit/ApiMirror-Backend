import { Elysia } from "elysia";
import { projectTokensController as controller } from "../container";
import { authPlugin } from "../auth/auth.plugin";
import { projectTokenParams } from "./project-tokens.dto";

export const projectTokensRoutes = new Elysia({ prefix: "/api/projects/:id/token" })
  .use(authPlugin)
  .onBeforeHandle(({ set }) => { set.headers["cache-control"] = "no-store"; })
  .get("", ({ userId, params }) => controller.get(userId, params.id), {
    params: projectTokenParams,
  })
  .post("/regenerate", ({ userId, params }) => controller.regenerate(userId, params.id), {
    params: projectTokenParams,
  });
