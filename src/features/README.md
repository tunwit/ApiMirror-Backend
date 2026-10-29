# Feature dependency initialization

`features/container.ts` is the single place that constructs feature repositories, services, mappers and controllers. Initialization happens directly at module scope, with no container factory functions. Classes receive dependencies through their constructors; DTOs remain in their features; Drizzle schemas and inferred record types live in `packages/database` and are imported through `@apimirror/database/schema`.

The shared projects repository is passed to the project-tokens service. That token service is injected into the projects service for automatic token generation and into the projects controller for settings. Mock routes receive the same projects service for ownership checks.

Route modules import their initialized controllers from `features/container.ts` and export Elysia instances directly. `app.ts` mounts those instances. The container does not import routes, avoiding circular initialization.

`auth/auth.plugin.ts` exports the shared `authPlugin` Elysia instance directly. It uses the configured Better Auth server and frontend URL for session and origin checks. Routes attach it with `.use(authPlugin)`.

No DI library is required. New dependencies should be passed into constructors and connected in `features/container.ts`. Feature-layer `new` calls belong in this shared container, not controllers or services.
