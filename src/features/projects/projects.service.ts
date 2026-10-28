import type { ProjectsRepo } from "./projects.repo";
import type { CreateProjectDto, UpdateProjectDto } from "./projects.dto";
import { NotFoundError } from "../../core/error";
import type { ProjectTokensService } from "../project-tokens/project-tokens.service";

export class ProjectsService {
  constructor(
    private readonly repo: ProjectsRepo,
    private readonly tokens: ProjectTokensService,
  ) {}

  list(ownerId: string) {
    return this.repo.findAll(ownerId);
  }

  async get(ownerId: string, id: string) {
    const record = await this.repo.findById(ownerId, id);
    if (!record) throw new NotFoundError("Project not found.");
    return record;
  }

  async create(ownerId: string, data: CreateProjectDto) {
    const generated = this.tokens.generate();
    const project = await this.repo.create(ownerId, {
      ...data,
      name: data.name.trim(),
    }, { tokenHash: generated.tokenHash, tokenPrefix: generated.tokenPrefix });
    return { ...project, token: generated.token };
  }

  async update(ownerId: string, id: string, data: UpdateProjectDto) {
    const record = await this.repo.update(ownerId, id, {
      ...data,
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    });
    if (!record) throw new NotFoundError("Project not found.");
    return record;
  }

  async delete(ownerId: string, id: string) {
    const record = await this.repo.delete(ownerId, id);
    if (!record) throw new NotFoundError("Project not found.");
  }
}
