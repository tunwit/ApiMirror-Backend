import type { ProjectTokensMapper } from "./project-tokens.mapper";
import type { ProjectTokensService } from "./project-tokens.service";

export class ProjectTokensController {
  constructor(
    private readonly service: ProjectTokensService,
    private readonly mapper: ProjectTokensMapper,
  ) {}

  async get(userId: string, projectId: string) {
    const record = await this.service.get(userId, projectId);
    return record ? this.mapper.toDto(record) : null;
  }

  async regenerate(userId: string, projectId: string) {
    const { record, token } = await this.service.regenerate(userId, projectId);
    return { ...this.mapper.toDto(record), token };
  }
}
