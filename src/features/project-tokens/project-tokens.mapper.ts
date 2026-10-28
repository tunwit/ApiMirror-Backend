import type { ProjectToken } from "./project-tokens.schema";
import type { ProjectTokenDto } from "./project-tokens.dto";

export class ProjectTokensMapper {
  toDto(record: ProjectToken): ProjectTokenDto {
    return {
      id: record.id,
      projectId: record.projectId,
      prefix: record.tokenPrefix,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
