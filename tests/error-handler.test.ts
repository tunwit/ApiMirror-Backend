import { describe, expect, spyOn, test } from "bun:test";
import { Elysia, status, t } from "elysia";
import { handleError } from "../src/core/error-handler";
import { ForbiddenError, UnauthorizedError } from "../src/core/error";

const app = new Elysia().onError(handleError)
  .get("/projects/:id", () => ({ ok: true }), {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
  })
  .post("/projects", () => ({ ok: true }), { body: t.Object({ name: t.String() }) })
  .get("/unauthorized", () => { throw new UnauthorizedError(); })
  .get("/forbidden", () => { throw new ForbiddenError(); })
  .get("/conflict", () => { throw status(409, { message: "Conflict." }); })
  .get("/failure", () => { throw new Error("private database details"); });

describe("backend error responses", () => {
  test("malformed JSON returns 400", async () => {
    const response = await app.handle(new Request("http://localhost/projects", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{broken",
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Request body must be valid JSON." });
  });

  test("invalid parameters and request bodies return 422", async () => {
    const requests = [
      new Request("http://localhost/projects/not-a-uuid"),
      new Request("http://localhost/projects", {
        method: "POST", headers: { "content-type": "application/json" }, body: '{"name":42}',
      }),
    ];
    for (const request of requests) {
      const response = await app.handle(request);
      expect(response.status).toBe(422);
      expect(await response.json()).toEqual({ message: "Invalid request parameters or body." });
    }
  });

  test("preserves authentication, authorization and not-found statuses", async () => {
    for (const [path, expected] of [["unauthorized", 401], ["forbidden", 403], ["missing", 404], ["conflict", 409]] as const) {
      const response = await app.handle(new Request(`http://localhost/${path}`));
      expect(response.status).toBe(expected);
    }
  });

  test("unexpected errors remain 500 without leaking details", async () => {
    const log = spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await app.handle(new Request("http://localhost/failure"));
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ message: "Unable to complete the request." });
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
