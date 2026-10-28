import { Elysia } from "elysia";
import { authentication, projects } from "../container";
import { createProjectBody, projectParams, updateProjectBody } from "./projects.dto";

const controller = projects.controller;

export const projectsRoutes = new Elysia({ prefix: "/api/projects" })
  .use(authentication.middleware)
  .get("", ({ userId }) => controller.list(userId))
  .get("/:id", ({ userId, params }) => controller.get(userId, params.id), {
    params: projectParams,
  })
  .get("/:id/settings", ({ userId, params, set }) => {
    set.headers["cache-control"] = "no-store";
    return controller.settings(userId, params.id);
  }, { params: projectParams })
  .post("", async ({ userId, body, status, set }) => {
    set.headers["cache-control"] = "no-store";
    return status(201, await controller.create(userId, body));
  }, { body: createProjectBody })
  .patch("/:id", ({ userId, params, body }) => controller.update(userId, params.id, body), {
    params: projectParams,
    body: updateProjectBody,
  })
  .delete("/:id", async ({ userId, params }) => {
    await controller.delete(userId, params.id);
    return new Response(null, { status: 204 });
  }, { params: projectParams });
