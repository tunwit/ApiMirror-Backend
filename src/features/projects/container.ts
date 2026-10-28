import type { Database } from "../../db";
import { createProjectTokensContainer } from "../project-tokens/container";
import { ProjectsRepo } from "./projects.repo";
import { ProjectsService } from "./projects.service";
import { ProjectsMapper } from "./projects.mapper";
import { ProjectsController } from "./projects.controller";

export function createProjectsContainer(db: Database, baseUrl: string) {
  const repo = new ProjectsRepo(db);
  const tokens = createProjectTokensContainer(db, repo);
  const service = new ProjectsService(repo, tokens.service);
  const mapper = new ProjectsMapper();
  const controller = new ProjectsController(service, tokens.service, mapper, tokens.mapper, baseUrl);
  return { repo, service, mapper, controller, tokens };
}
