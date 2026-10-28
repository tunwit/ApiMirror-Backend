import type { MockRoutesMapper } from "./mock-routes.mapper";
import type { MockRoutesService } from "./mock-routes.service";
import type { CreateMockRouteDto, UpdateMockRouteDto } from "./mock-routes.dto";

export class MockRoutesController {
  constructor(
    private readonly service: MockRoutesService,
    private readonly mapper: MockRoutesMapper,
  ) {}

  async get(userId: string, projectId: string, routeId: string) {
    return this.mapper.toDto(await this.service.get(userId, projectId, routeId));
  }
  async update(userId: string, projectId: string, routeId: string, body: UpdateMockRouteDto) {
    return this.mapper.toDto(await this.service.update(userId, projectId, routeId, body));
  }
  async create(userId: string, projectId: string, body: CreateMockRouteDto) {
    return this.mapper.toDto(await this.service.create(userId, projectId, body));
  }
  async list(userId: string, projectId: string) {
    return (await this.service.list(userId, projectId)).map((route) => this.mapper.toDto(route));
  }
}
