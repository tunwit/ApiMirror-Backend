import type { Project } from "@apimirror/database/schema";
import type { ProjectDto } from "./projects.dto";

export class ProjectsMapper {
  toDto(record: Project & { routeCount?: number }): ProjectDto {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      routeCount: record.routeCount,
    };
  }
}
