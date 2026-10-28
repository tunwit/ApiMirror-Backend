import { t } from "elysia";

export const projectTokenParams = t.Object({ id: t.String({ format: "uuid" }) });

export type ProjectTokenDto = {
  id: string;
  projectId: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
};
