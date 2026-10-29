import { env } from "../config/config";
import { db } from "../config/database";
import { ProjectsRepo } from "./projects/projects.repo";
import { ProjectsService } from "./projects/projects.service";
import { ProjectsMapper } from "./projects/projects.mapper";
import { ProjectsController } from "./projects/projects.controller";
import { ProjectTokensRepo } from "./project-tokens/project-tokens.repo";
import { ProjectTokensService } from "./project-tokens/project-tokens.service";
import { ProjectTokensMapper } from "./project-tokens/project-tokens.mapper";
import { ProjectTokensController } from "./project-tokens/project-tokens.controller";
import { MockRoutesRepo } from "./mock-routes/mock-routes.repo";
import { MockRoutesService } from "./mock-routes/mock-routes.service";
import { MockRoutesMapper } from "./mock-routes/mock-routes.mapper";
import { MockRoutesController } from "./mock-routes/mock-routes.controller";

const projectsRepo = new ProjectsRepo(db);
const projectTokensRepo = new ProjectTokensRepo(db);
const projectTokensService = new ProjectTokensService(projectTokensRepo, projectsRepo);
const projectTokensMapper = new ProjectTokensMapper();
const projectsService = new ProjectsService(projectsRepo, projectTokensService);
const projectsMapper = new ProjectsMapper();
const mockRoutesRepo = new MockRoutesRepo(db);
const mockRoutesService = new MockRoutesService(mockRoutesRepo, projectsService);
const mockRoutesMapper = new MockRoutesMapper();

export const projectsController = new ProjectsController(
  projectsService,
  projectTokensService,
  projectsMapper,
  projectTokensMapper,
  env.playgroundURL,
);
export const projectTokensController = new ProjectTokensController(projectTokensService, projectTokensMapper);
export const mockRoutesController = new MockRoutesController(mockRoutesService, mockRoutesMapper);
