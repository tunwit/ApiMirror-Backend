import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import type { Database } from "@apimirror/database";
import { project } from "@apimirror/database/schema";
import type { CreateProjectDto, UpdateProjectDto } from "./projects.dto";
import { mockRoute } from "@apimirror/database/schema";
import { projectToken, type NewProjectToken } from "@apimirror/database/schema";

const projectFields = {
  ...getTableColumns(project),
  routeCount: sql<number>`(select count(*)::int from ${mockRoute} where ${mockRoute.projectId} = ${project.id})`,
};

export class ProjectsRepo {
  constructor(private readonly db: Database) {}

  findAll(ownerId: string) {
    return this.db.select(projectFields).from(project)
      .where(eq(project.ownerId, ownerId))
      .orderBy(desc(project.createdAt), desc(project.id));
  }

  async findById(ownerId: string, id: string) {
    const [record] = await this.db.select(projectFields).from(project)
      .where(and(eq(project.id, id), eq(project.ownerId, ownerId)))
      .limit(1);
    return record;
  }

  create(ownerId: string, data: CreateProjectDto, token: Pick<NewProjectToken, "tokenHash" | "tokenPrefix">) {
    return this.db.transaction(async (tx) => {
      const [record] = await tx.insert(project).values({ ...data, ownerId }).returning();
      await tx.insert(projectToken).values({ ...token, projectId: record!.id });
      return record!;
    });
  }

  async update(ownerId: string, id: string, data: UpdateProjectDto) {
    const [record] = await this.db.update(project).set(data)
      .where(and(eq(project.id, id), eq(project.ownerId, ownerId)))
      .returning();
    return record;
  }

  async delete(ownerId: string, id: string) {
    const [record] = await this.db.delete(project)
      .where(and(eq(project.id, id), eq(project.ownerId, ownerId)))
      .returning({ id: project.id });
    return record;
  }
}
