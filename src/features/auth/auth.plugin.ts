import { Elysia } from "elysia";
import { auth } from "../../auth";
import { env } from "../../config/config";
import { ForbiddenError, UnauthorizedError } from "../../core/error";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .resolve({ as: "scoped" }, async ({ request }) => {
    const origin = request.headers.get("origin");
    if (request.method !== "GET" && origin && origin !== new URL(env.frontendURL).origin) {
      throw new ForbiddenError("Origin not allowed.");
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new UnauthorizedError();
    return { userId: session.user.id };
  });
