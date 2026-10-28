# Projects API

All endpoints require the existing Better Auth session cookie. The frontend can call `/api/projects` on its own origin through the Next.js rewrite. Restart the frontend after adding the rewrite.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/projects` | 200: current user's projects, newest first |
| GET | `/api/projects/:id` | 200: one owned project |
| GET | `/api/projects/:id/settings` | 200: project, mock base URL and token metadata |
| POST | `/api/projects` | 201: created project |
| PATCH | `/api/projects/:id` | 200: updated project |
| DELETE | `/api/projects/:id` | 204: deleted, no response body |

Create body:

```json
{
  "name": "My API",
  "description": "Mocks for the frontend"
}
```

`name` is required, must contain a non-whitespace character, and is limited to 100 characters. Names are trimmed before storage. `description` is optional, accepts null and is limited to 2,000 characters.

PATCH accepts either or both fields, and requires at least one. Set `description` to null to clear it. Clients cannot set IDs, ownership or timestamps.

Responses contain `id`, `name`, `description`, `createdAt` and `updatedAt`. Dates are ISO strings. Listing returns a JSON array; other successful reads/writes return a single project object. There is no pagination in this MVP.

Unauthenticated requests return 401. Missing projects and projects belonging to another user both return 404. Cross-origin browser mutations are rejected with 403 unless the Origin matches `FRONTEND_URL`. Database operations always filter by the authenticated owner's ID.

The base `DomainError` lives in `src/core/domain-error.ts`. Shared errors in `src/core/error.ts` extend it: `BadRequestError`, `UnauthorizedError`, `ForbiddenError` and `NotFoundError`. The central `onError` handler in `src/app.ts` checks only `instanceof DomainError` and returns its status and message. Every other error, including framework validation, parsing and unmatched-route errors, returns a generic 500 response and is logged server-side. Better Auth continues to handle responses inside its mounted handler.

Deleting a project also deletes its routes and token through database foreign keys. Creating a project automatically creates its token in the same transaction. The creation response includes a `token` string, shown only in that response. Normal project reads do not expose it.

## Settings and project tokens

The existing PATCH endpoint updates the project name/description, and DELETE removes the project. All settings and token endpoints require the owner's cookie session.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/projects/:id/settings` | `{ project, baseUrl, token }` |
| GET | `/api/projects/:id/token` | Token metadata, or null for a project without a token |
| POST | `/api/projects/:id/token/regenerate` | Token metadata plus the new full `token` string |

Token metadata contains `id`, `projectId`, `prefix`, `createdAt` and `updatedAt`. Only a SHA-256 hash and display prefix are stored in PostgreSQL. The full token is generated from 32 cryptographically random bytes and returned only on project creation or regeneration. There is no reveal endpoint; copy/save the token when it is issued. Regeneration atomically replaces the stored hash, so future verification will accept only the new token. It also creates a token for an older project that has none.

Settings and token responses and the project creation response use `Cache-Control: no-store`. Hashes are never serialized into responses. The `baseUrl` points to `/mock/{projectId}` on the configured backend URL; the mock execution handler is not implemented by this settings work. The frontend settings page remains UI-only.

The project tables must exist before these endpoints can be used. Apply the previously generated migration with `bun run db:migrate` from `backend/`; this implementation does not apply it automatically.

Request flow: route (validation/session/status) → controller (input/output mapping) → service (rules) → repo (database). Table definitions stay in `projects.schema.ts`, validation/contracts in `projects.dto.ts`, and response mapping in `projects.mapper.ts`.
