import { t } from "elysia";

const name = t.String({ minLength: 1, maxLength: 100, pattern: "\\S" });
const description = t.Union([t.String({ maxLength: 2000 }), t.Null()]);

export const projectParams = t.Object({ id: t.String({ format: "uuid" }) });

export const createProjectBody = t.Object({
  name,
  description: t.Optional(description),
}, { additionalProperties: false });

export const updateProjectBody = t.Object({
  name: t.Optional(name),
  description: t.Optional(description),
}, { additionalProperties: false, minProperties: 1 });

export type CreateProjectDto = typeof createProjectBody.static;
export type UpdateProjectDto = typeof updateProjectBody.static;

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  routeCount?: number;
};
