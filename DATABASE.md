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
- Store a pathname beginning with `/`, without query strings or fragments. Start with exact path matching. Parameterized paths and query matching are outside this step.
- `status_code` defaults to 200 and is constrained to 100–599. The future handler must obey HTTP rules for responses that cannot carry bodies, including HEAD and 204/304.
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
src/
  features/
    auth/
      auth.schema.ts
    projects/
      projects.route.ts
      projects.controller.ts
      projects.service.ts
      projects.dto.ts
      projects.mapper.ts
      projects.repo.ts
      projects.schema.ts
    mock-routes/
      mock-routes.route.ts
      mock-routes.controller.ts
      mock-routes.service.ts
      mock-routes.dto.ts
      mock-routes.mapper.ts
      mock-routes.repo.ts
      mock-routes.schema.ts
    project-tokens/
      project-tokens.route.ts
      project-tokens.controller.ts
      project-tokens.service.ts
      project-tokens.dto.ts
      project-tokens.mapper.ts
      project-tokens.repo.ts
      project-tokens.schema.ts
  db/
    index.ts
    schema.ts
```

Every application feature uses `<feature>.<layer>.ts` filenames, plus a `container.ts` that constructs and connects its class instances:

| Layer | Responsibility |
| --- | --- |
| `route` | Declare Elysia endpoints and attach DTO validation and controllers |
| `controller` | Read HTTP input, call services and set HTTP responses |
| `service` | Business rules, ownership checks and coordination |
| `dto` | Request validation and public response contracts |
| `mapper` | Convert database records into public response DTOs |
| `repo` | Database queries using Drizzle |
| `schema` | Drizzle table definitions and inferred database types |

Repositories, services, mappers and controllers are classes with constructor-injected dependencies. Each feature's `container.ts` creates its classes; `features/container.ts` connects the features. Route modules export Elysia instances directly, and `app.ts` mounts them. DTOs and table schemas remain declarations. Better Auth handles authentication endpoints and credentials; the auth feature has its own plugin class and container. See `src/features/README.md` for the dependency wiring.

`db/schema.ts` exports the feature schemas for Drizzle and Better Auth, keeping current imports compatible. There are no Drizzle relation definitions; use explicit joins in repositories when querying across tables. Database foreign keys still enforce ownership references and cascading deletes.

## Migration

The generated migration adds the three application tables and HTTP method enum. It preserves all existing authentication records. When ready to create these tables, run `bun run db:migrate` from `backend/`.
