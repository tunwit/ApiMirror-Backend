import { hashPassword, verifyPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { account, user } from "../src/db/schema";

try {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This mock account is for local development only.");
  }

  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(user).where(eq(user.username, "admin"));

    if (existing) {
      const [credentials] = await tx
        .select()
        .from(account)
        .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")));

      if (!credentials?.password || !await verifyPassword({ hash: credentials.password, password: "1234" })) {
        throw new Error("An admin user already exists with different credentials. It was not changed.");
      }

      console.log("Mock admin already exists.");
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date();
    await tx.insert(user).values({
      id,
      name: "Admin",
      email: "admin@example.invalid",
      emailVerified: false,
      username: "admin",
      displayUsername: "admin",
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword("1234"),
      createdAt: now,
      updatedAt: now,
    });
    console.log("Created local mock user: admin.");
  });
} finally {
  await pool.end();
}
