import { t } from "elysia";

export const projectRouteParams = t.Object({ id: t.String({ format: "uuid" }) });
export const mockRouteParams = t.Object({
  id: t.String({ format: "uuid" }),
  routeId: t.String({ format: "uuid" }),
});

export const createMockRouteBody = t.Object({
  method: t.Union([
    t.Literal("GET"), t.Literal("POST"), t.Literal("PUT"), t.Literal("PATCH"),
    t.Literal("DELETE"), t.Literal("HEAD"), t.Literal("OPTIONS"),
  ]),
  path: t.String({ minLength: 1, maxLength: 2048, pattern: "^/[^\\s?#]*$" }),
  statusCode: t.Integer({ minimum: 100, maximum: 599 }),
  responseBody: t.Any(),
  requiredBody: t.Array(t.String({ minLength: 1, maxLength: 100 }), { uniqueItems: true }),
}, { additionalProperties: false });

export type CreateMockRouteDto = typeof createMockRouteBody.static;

export const updateMockRouteBody = t.Partial(createMockRouteBody, { minProperties: 1 });
export type UpdateMockRouteDto = typeof updateMockRouteBody.static;
