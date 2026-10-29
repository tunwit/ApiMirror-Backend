import { and, asc, eq, sql } from "drizzle-orm";
import type { Database } from "@apimirror/database";
import { mockRoute } from "@apimirror/database/schema";
import type { CreateMockRouteDto, UpdateMockRouteDto } from "./mock-routes.dto";

export class MockRoutesRepo {
  constructor(private readonly db: Database) {}

  async findById(projectId: string, routeId: string) {
    const [route] = await this.db.select().from(mockRoute)
      .where(and(eq(mockRoute.projectId, projectId), eq(mockRoute.id, routeId)))
      .limit(1);
    return route;
  }
  async update(projectId: string, routeId: string, data: UpdateMockRouteDto) {
    const [route] = await this.db.update(mockRoute).set({
      ...data,
      ...(data.responseBody !== undefined ? { responseBody: sql`${JSON.stringify(data.responseBody)}::jsonb` } : {}),
    }).where(and(eq(mockRoute.projectId, projectId), eq(mockRoute.id, routeId))).returning();
    return route;
  }
  async create(projectId: string, data: CreateMockRouteDto) {
    const [route] = await this.db.insert(mockRoute).values({
      ...data,
      projectId,
      responseBody: sql`${JSON.stringify(data.responseBody)}::jsonb`,
    }).onConflictDoNothing({ target: [mockRoute.projectId, mockRoute.method, mockRoute.path] }).returning();
    return route;
  }
  list(projectId: string) {
    return this.db.select().from(mockRoute)
      .where(eq(mockRoute.projectId, projectId))
      .orderBy(asc(mockRoute.path), asc(mockRoute.method));
  }
}
