import type { Database } from "../../db";
import type { ProjectsService } from "../projects/projects.service";
import { MockRoutesRepo } from "./mock-routes.repo";
import { MockRoutesService } from "./mock-routes.service";
import { MockRoutesMapper } from "./mock-routes.mapper";
import { MockRoutesController } from "./mock-routes.controller";

export function createMockRoutesContainer(db: Database, projectsService: ProjectsService) {
  const repo = new MockRoutesRepo(db);
  const service = new MockRoutesService(repo, projectsService);
  const mapper = new MockRoutesMapper();
  const controller = new MockRoutesController(service, mapper);
  return { repo, service, mapper, controller };
}
