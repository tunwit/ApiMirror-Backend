import { describe, expect, mock, test } from "bun:test";
import type { MockRoute } from "@apimirror/database/schema";
import { MockRoutesService } from "../src/features/mock-routes/mock-routes.service";
import { NotFoundError } from "../src/core/error";

const route: MockRoute = {
  id: "650e8400-e29b-41d4-a716-446655440000",
  projectId: "550e8400-e29b-41d4-a716-446655440000",
  method: "POST", path: "/users", statusCode: 200,
  responseBody: { message: "Hello {{body.name}}" }, requiredBody: ["name"],
  createdAt: new Date(), updatedAt: new Date(),
};

function setup(current: MockRoute | undefined = route, authorized = true) {
  const findById = mock(async () => current);
  const create = mock(async () => route);
  const update = mock(async () => route);
  const service = new MockRoutesService({
    findById, create, update, list: () => { throw new Error("Unused"); },
  }, {
    get: async () => {
      if (!authorized) throw new NotFoundError("Project not found.");
      return {
        id: route.projectId, ownerId: "owner", name: "Test", description: null,
        createdAt: new Date(), updatedAt: new Date(), routeCount: 1,
      };
    },
  });
  return { service, findById, create, update };
}

describe("mock route request body configuration", () => {
  test("rejects required fields and nested body placeholders for GET/HEAD creation", async () => {
    for (const method of ["GET", "HEAD"] as const) {
      for (const config of [
        { requiredBody: ["name"], responseBody: {} },
        { requiredBody: [], responseBody: { nested: ["Hello {{ body.name }}"] } },
      ]) {
        const { service, create } = setup();
        await expect(service.create("owner", route.projectId, { ...route, method, ...config }))
          .rejects.toMatchObject({ status: 400 });
        expect(create).not.toHaveBeenCalled();
      }
    }
  });

  test("allows path placeholders for GET/HEAD and body fields for other supported methods", async () => {
    for (const method of ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const) {
      const { service, create } = setup();
      const data = method === "GET" || method === "HEAD"
        ? { ...route, method, requiredBody: [], responseBody: { id: "{{params.id}}" } }
        : { ...route, method };
      await service.create("owner", route.projectId, data);
      expect(create).toHaveBeenCalledTimes(1);
    }
  });

  test("validates method-only patches against the saved body configuration", async () => {
    const { service, update } = setup();
    await expect(service.update("owner", route.projectId, route.id, { method: "GET" }))
      .rejects.toMatchObject({ status: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  test("validates body-only patches against the saved method", async () => {
    const { service, update } = setup({ ...route, method: "HEAD", requiredBody: [], responseBody: {} });
    for (const data of [{ requiredBody: ["name"] }, { responseBody: ["{{body.name}}"] }]) {
      await expect(service.update("owner", route.projectId, route.id, data)).rejects.toMatchObject({ status: 400 });
    }
    expect(update).not.toHaveBeenCalled();
  });

  test("allows switching to GET when body dependencies are removed together", async () => {
    const { service, update } = setup();
    await service.update("owner", route.projectId, route.id, {
      method: "GET", requiredBody: [], responseBody: { id: "{{params.id}}" },
    });
    expect(update).toHaveBeenCalledTimes(1);
  });

  test("checks ownership before reading the route or validating its body", async () => {
    const { service, findById, update } = setup(route, false);
    await expect(service.update("other", route.projectId, route.id, { method: "GET" }))
      .rejects.toMatchObject({ status: 404 });
    expect(findById).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
