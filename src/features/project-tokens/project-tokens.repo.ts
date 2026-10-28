import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import { projectToken, type NewProjectToken } from "./project-tokens.schema";

export class ProjectTokensRepo {
  constructor(private readonly db: Database) {}

  async findByProject(projectId: string) {
    const [token] = await this.db.select().from(projectToken)
      .where(eq(projectToken.projectId, projectId)).limit(1);
    return token;
  }

  async replace(projectId: string, data: Pick<NewProjectToken, "tokenHash" | "tokenPrefix">) {
    const [token] = await this.db.insert(projectToken).values({ ...data, projectId })
      .onConflictDoUpdate({
        target: projectToken.projectId,
        set: { ...data, updatedAt: new Date() },
      }).returning();
    return token!;
  }
}
