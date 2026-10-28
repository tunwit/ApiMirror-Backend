import { Elysia } from "elysia";
import { authentication, mockRoutes } from "../container";
import { createMockRouteBody, mockRouteParams, projectRouteParams, updateMockRouteBody } from "./mock-routes.dto";

const controller = mockRoutes.controller;

export const mockRoutesRoutes = new Elysia({ prefix: "/api/projects/:id/routes" })
  .use(authentication.middleware)
  .get("", ({ userId, params }) => controller.list(userId, params.id), {
    params: projectRouteParams,
  })
  .post("", async ({ userId, params, body, status }) => {
    return status(201, await controller.create(userId, params.id, body));
  }, { params: projectRouteParams, body: createMockRouteBody })
  .get("/:routeId", ({ userId, params }) => controller.get(userId, params.id, params.routeId), {
    params: mockRouteParams,
  })
  .patch("/:routeId", ({ userId, params, body }) => controller.update(userId, params.id, params.routeId, body), {
    params: mockRouteParams,
    body: updateMockRouteBody,
  });
