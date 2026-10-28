import { auth } from "../auth";
import { env } from "../config/config";
import { db } from "../db";
import { createAuthContainer } from "./auth/container";
import { createProjectsContainer } from "./projects/container";
import { createMockRoutesContainer } from "./mock-routes/container";

export const authentication = createAuthContainer(auth, env.frontendURL);
export const projects = createProjectsContainer(db, env.authURL);
export const mockRoutes = createMockRoutesContainer(db, projects.service);
