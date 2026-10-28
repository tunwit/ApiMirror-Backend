import type { CreateProjectDto, UpdateProjectDto } from "./projects.dto";
import type { ProjectsMapper } from "./projects.mapper";
import type { ProjectsService } from "./projects.service";
import type { ProjectTokensService } from "../project-tokens/project-tokens.service";
import type { ProjectTokensMapper } from "../project-tokens/project-tokens.mapper";

export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    private readonly tokens: ProjectTokensService,
    private readonly mapper: ProjectsMapper,
    private readonly tokenMapper: ProjectTokensMapper,
    private readonly baseUrl: string,
  ) {}

  async list(userId: string) {
    const projects = await this.service.list(userId);
    return projects.map((project) => this.mapper.toDto(project));
  }

  async get(userId: string, id: string) {
    return this.mapper.toDto(await this.service.get(userId, id));
  }

  async create(userId: string, body: CreateProjectDto) {
    const project = await this.service.create(userId, body);
    return { ...this.mapper.toDto(project), token: project.token };
  }

  async settings(userId: string, id: string) {
    const project = await this.service.get(userId, id);
    const token = await this.tokens.get(userId, id);
    return {
      project: this.mapper.toDto(project),
      baseUrl: new URL(`/mock/${id}`, this.baseUrl).toString(),
      token: token ? this.tokenMapper.toDto(token) : null,
    };
  }

  async update(userId: string, id: string, body: UpdateProjectDto) {
    return this.mapper.toDto(await this.service.update(userId, id, body));
  }

  delete(userId: string, id: string) {
    return this.service.delete(userId, id);
  }
}
