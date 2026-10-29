# ApiMirror database design

PostgreSQL with Drizzle ORM. This step defines schemas and a migration; it does not implement API endpoints or apply changes to the running database.

## Relationships

```text
user (Better Auth)
  └── projects (one user owns many)
        ├── mock routes (many per project)
        └── project token (at most one per project)
```

Deleting a user deletes their projects. Deleting a project deletes its routes and token through foreign-key cascades. There are no teams or shared projects in this MVP.

## Tables

| Table | Purpose | Main fields |
| --- | --- | --- |
| `user` | Better Auth identity | Existing name, email, username and timestamps |
| `account` | Better Auth credentials | Existing user reference and password hash |
| `session` | Better Auth cookie sessions | Existing user reference, token and expiry |
| `verification` | Better Auth verification records | Existing identifier, value and expiry |
| `project` | A user's mock API project | UUID, owner ID, name, optional description, timestamps |
| `mock_route` | One configured mock endpoint | UUID, project ID, path, method, status code, response body, required body fields, timestamps |
| `project_token` | Credential for calling a project's mocks | UUID, unique project ID, unique token hash, display prefix, timestamps |

Better Auth's existing tables and column definitions are preserved. Application tables use UUIDs and timezone-aware timestamps. Drizzle supplies `updated_at` when updating through the ORM; raw SQL updates must set it explicitly.

## Mock route rules

- The combination of project, method and path is unique. `GET /users` and `POST /users` can coexist in the same project.
- Supported methods: GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS.
- Store a pathname beginning with `/`, without query strings or fragments. The playground supports exact paths and full-segment parameters such as `/users/:id`, with exact paths taking priority. Query strings do not participate in matching. Use `{{params.id}}` in response-body string values to insert a captured parameter; nested objects and arrays are supported.
- `status_code` defaults to 200 and is constrained to 200–599. The playground returns the configured JSON body and status, suppressing the body for HEAD requests and statuses 204, 205 and 304.
- `response_body` stores JSON and defaults to `{}`. SQL NULL is disallowed; JSON null remains a valid JSON response.
- `required_body` stores a list of required top-level JSON field names, defaulting to `[]`. For example, `["email", "password"]` requires those two properties in the request body.
- Missing required fields or an invalid/non-object JSON body when fields are required will return 400 before the configured response. Presence is the MVP rule: `false`, `0`, an empty string and JSON null count as present. Nested rules, type validation and matching exact values can be added later.
- Drizzle's TypeScript type describes the string array; the database checks that the value is an array. The future request validator must enforce non-empty, unique string entries.

Example configuration: `POST /login`, required body `["email", "password"]`, status `200`, response `{"success": true}`. A request missing `password` receives a simulated 400; one containing both fields receives the configured response. No passwords submitted to a mock endpoint are stored by this schema.

## Authentication and project tokens

Dashboard operations use the existing Better Auth session cookie. Every project operation must be scoped to the signed-in user's ID; knowing a project UUID alone does not grant access.

Mock API calls will use `Authorization: Bearer <project-token>` and a project UUID in the URL, such as `/mock/{projectId}/users`. This keeps the same-domain approach and separates identical paths in different projects.

Each project has at most one token. Project creation generates a token from 32 cryptographically random bytes and saves its SHA-256 hash and display prefix in the same transaction as the project. The full value is returned only on creation or regeneration. Settings endpoints return metadata; the full token cannot be retrieved later. Regeneration replaces the stored hash. The public mock handler and bearer-token verification are not yet implemented. Hashes are never exposed in API responses. See `src/features/projects/README.md` for the settings endpoints.

## Feature-first structure

```text
packages/database/
  src/
    index.ts                 # createDatabase and Database type
    schema/                  # Shared tables and inferred record types
  drizzle/                   # SQL migrations, snapshots and journal
backend/src/
  config/database.ts         # Backend-owned connection instance
  features/
    container.ts             # Feature dependency initialization
    auth/                    # Elysia authentication plugin
    projects/                # Routes, controllers, services, DTOs, mappers, repos
    mock-routes/
    project-tokens/
```

Feature repositories and mappers import schema declarations from `@apimirror/database/schema`. Repositories import the shared `Database` type from `@apimirror/database`. Each app calls `createDatabase(connectionString)` once to create its own pool and Drizzle instance; the package does not read app configuration or initialize connections on import.

Repositories, services, mappers and controllers are classes with constructor-injected dependencies. `features/container.ts` directly initializes all feature classes and connects their dependencies. Route modules export Elysia instances directly, and `app.ts` mounts them. DTOs and table schemas remain declarations. Better Auth handles authentication endpoints and credentials; the auth feature exports its Elysia plugin instance directly. See `src/features/README.md` for the dependency wiring.

`packages/database/src/schema/index.ts` exports the shared schemas for Drizzle and Better Auth. There are no Drizzle relation definitions; use explicit joins in repositories when querying across tables. Database foreign keys still enforce ownership references and cascading deletes.

## Migration

Migration `0002_elite_james_howlett.sql` narrows the status-code constraint to 200–599. Before applying it, update any existing routes with 1xx codes to the intended final response code. The migration preserves stored data and will fail validation if unsupported codes remain.

Migration files, snapshots and the journal live in `packages/database/drizzle/`; backend Drizzle commands point to this shared history. The existing migration adds the three application tables and HTTP method enum. It preserves all existing authentication records. When ready to create these tables, run `bun run db:migrate` from `backend/`.
