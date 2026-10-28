import { createHash, randomBytes } from "node:crypto";
import { NotFoundError } from "../../core/error";
import type { ProjectsRepo } from "../projects/projects.repo";
import type { ProjectTokensRepo } from "./project-tokens.repo";

export class ProjectTokensService {
  constructor(
    private readonly repo: ProjectTokensRepo,
    private readonly projects: ProjectsRepo,
  ) {}

  generate() {
    const token = `am_live_${randomBytes(32).toString("base64url")}`;
    return {
      token,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      tokenPrefix: token.slice(0, 16),
    };
  }

  private async requireProject(ownerId: string, projectId: string) {
    const project = await this.projects.findById(ownerId, projectId);
    if (!project) throw new NotFoundError("Project not found.");
  }

  async get(ownerId: string, projectId: string) {
    await this.requireProject(ownerId, projectId);
    return this.repo.findByProject(projectId);
  }

  async regenerate(ownerId: string, projectId: string) {
    await this.requireProject(ownerId, projectId);
    const generated = this.generate();
    const record = await this.repo.replace(projectId, {
      tokenHash: generated.tokenHash,
      tokenPrefix: generated.tokenPrefix,
    });
    return { record, token: generated.token };
  }
}
