import type { ProjectsService } from "../projects/projects.service";
import type { MockRoutesRepo } from "./mock-routes.repo";
import type { CreateMockRouteDto, UpdateMockRouteDto } from "./mock-routes.dto";
import { BadRequestError, NotFoundError } from "../../core/error";

export class MockRoutesService {
  constructor(
    private readonly repo: MockRoutesRepo,
    private readonly projects: ProjectsService,
  ) {}

  async get(userId: string, projectId: string, routeId: string) {
    await this.projects.get(userId, projectId);
    const route = await this.repo.findById(projectId, routeId);
    if (!route) throw new NotFoundError("Route not found.");
    return route;
  }
  async update(userId: string, projectId: string, routeId: string, data: UpdateMockRouteDto) {
    await this.projects.get(userId, projectId);
    try {
      const route = await this.repo.update(projectId, routeId, data);
      if (!route) throw new NotFoundError("Route not found.");
      return route;
    } catch (error) {
      if ((error as { cause?: { code?: string } }).cause?.code === "23505") {
        throw new BadRequestError("A route with this method and path already exists.");
      }
      throw error;
    }
  }
  async create(userId: string, projectId: string, data: CreateMockRouteDto) {
    await this.projects.get(userId, projectId);
    const route = await this.repo.create(projectId, data);
    if (!route) throw new BadRequestError("A route with this method and path already exists.");
    return route;
  }
  async list(userId: string, projectId: string) {
    await this.projects.get(userId, projectId);
    return this.repo.list(projectId);
  }
}
