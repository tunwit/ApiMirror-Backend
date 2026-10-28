import { Elysia } from "elysia";
import { authentication, projects } from "../container";
import { projectTokenParams } from "./project-tokens.dto";

const controller = projects.tokens.controller;

export const projectTokensRoutes = new Elysia({ prefix: "/api/projects/:id/token" })
  .use(authentication.middleware)
  .onBeforeHandle(({ set }) => { set.headers["cache-control"] = "no-store"; })
  .get("", ({ userId, params }) => controller.get(userId, params.id), {
    params: projectTokenParams,
  })
  .post("/regenerate", ({ userId, params }) => controller.regenerate(userId, params.id), {
    params: projectTokenParams,
  });
