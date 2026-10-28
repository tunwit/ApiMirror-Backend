import { Elysia } from "elysia";
import type { auth } from "../../auth";
import { ForbiddenError, UnauthorizedError } from "../../core/error";

export class AuthPlugin {
  constructor(
    private readonly server: typeof auth,
    private readonly frontendUrl: string,
  ) {}

  register() {
    return new Elysia({ name: "auth-plugin" })
      .resolve({ as: "scoped" }, async ({ request }) => {
        const origin = request.headers.get("origin");
        if (request.method !== "GET" && origin && origin !== new URL(this.frontendUrl).origin) {
          throw new ForbiddenError("Origin not allowed.");
        }

        const session = await this.server.api.getSession({ headers: request.headers });
        if (!session) throw new UnauthorizedError();
        return { userId: session.user.id };
      });
  }
}

export type AuthMiddleware = ReturnType<AuthPlugin["register"]>;
