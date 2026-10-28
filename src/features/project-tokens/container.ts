import type { Database } from "../../db";
import type { ProjectsRepo } from "../projects/projects.repo";
import { ProjectTokensRepo } from "./project-tokens.repo";
import { ProjectTokensService } from "./project-tokens.service";
import { ProjectTokensMapper } from "./project-tokens.mapper";
import { ProjectTokensController } from "./project-tokens.controller";

export function createProjectTokensContainer(db: Database, projectsRepo: ProjectsRepo) {
  const repo = new ProjectTokensRepo(db);
  const service = new ProjectTokensService(repo, projectsRepo);
  const mapper = new ProjectTokensMapper();
  const controller = new ProjectTokensController(service, mapper);
  return { repo, service, mapper, controller };
}
