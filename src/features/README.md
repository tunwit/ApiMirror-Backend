# Feature containers and dependency injection

Each feature's `container.ts` constructs its repository, service, mapper and controller classes. Classes receive dependencies through their constructors. They do not import initialized repositories or services. DTOs and Drizzle schemas remain declarations.

`features/container.ts` creates and exports the shared feature containers, supplying the database, configuration and authentication middleware. Route modules import their initialized controller and export an Elysia instance directly. `app.ts` mounts those instances.

The projects container creates its repository first and passes it into the project-tokens container. The resulting token service is injected into the projects service for automatic token generation, and into the projects controller for settings. Mock routes receive the same projects service for ownership checks. This keeps dependencies explicit without circular container imports.

Route modules use `export const projectsRoutes = new Elysia(...)` and equivalent declarations for other features. There are no route functions, route classes or route `register()` methods. Containers do not import routes, avoiding circular initialization. Authentication uses an injected Better Auth server and frontend URL. Existing URLs, session checks, domain errors, project/token transactions and response formats are preserved.

No DI library is required. New dependencies should be passed into constructors and connected in the feature container. `new` calls for feature layers belong in containers, not controllers or services.
