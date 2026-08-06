import { Router, type IRouter } from "express";
import { db, workspaceDatabasesTable, activityItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId, encrypt } from "../lib/ids.js";
import { param } from "../lib/params.js";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateDbPassword(): string {
  return randomBytes(16).toString("base64url");
}

router.get("/workspaces/:workspaceId/databases", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const databases = await db.select().from(workspaceDatabasesTable)
    .where(eq(workspaceDatabasesTable.workspaceId, workspaceId));

  res.json(databases.map(d => ({
    id: d.id,
    workspaceId: d.workspaceId,
    dbType: d.dbType,
    dbName: d.dbName,
    dbUser: d.dbUser,
    dbHost: d.dbHost,
    dbPort: d.dbPort,
    dbPassword: null,
    connectionUrl: d.connectionUrl,
    createdAt: d.createdAt,
  })));
});

router.post("/workspaces/:workspaceId/databases", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { dbType } = req.body;

  if (!dbType || !["mysql", "postgres"].includes(dbType)) {
    res.status(400).json({ error: "dbType must be mysql or postgres" });
    return;
  }

  const wsId = workspaceId.replace(/[^a-z0-9]/gi, "").slice(0, 12);
  const dbUser = `ws_${wsId}`;
  const dbName = `${dbUser}_db`;
  const dbPassword = generateDbPassword();
  const dbHost = dbType === "mysql" ? "mysql.internal" : "postgres.internal";
  const dbPort = dbType === "mysql" ? 3306 : 5432;
  const connectionUrl = dbType === "postgres"
    ? `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
    : `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  const [database] = await db.insert(workspaceDatabasesTable).values({
    id: generateId("db"),
    workspaceId,
    dbType,
    dbName,
    dbUser,
    dbHost,
    dbPort,
    dbPasswordEncrypted: encrypt(dbPassword),
    connectionUrl,
  }).returning();

  await db.insert(activityItemsTable).values({
    id: generateId("act"),
    userId: req.user!.id,
    workspaceId,
    workspaceName: workspaceId,
    type: "database_provisioned",
    message: `${dbType === "mysql" ? "MySQL" : "PostgreSQL"} database provisioned`,
  }).catch(() => {});

  res.status(201).json({
    id: database.id,
    workspaceId: database.workspaceId,
    dbType: database.dbType,
    dbName: database.dbName,
    dbUser: database.dbUser,
    dbHost: database.dbHost,
    dbPort: database.dbPort,
    dbPassword,
    connectionUrl: database.connectionUrl,
    createdAt: database.createdAt,
  });
});

router.delete("/workspaces/:workspaceId/databases/:databaseId", requireAuth, async (req, res): Promise<void> => {
  const databaseId = param(req.params.databaseId);
  await db.delete(workspaceDatabasesTable).where(eq(workspaceDatabasesTable.id, databaseId));
  res.json({ success: true, message: "Database dropped" });
});

router.post("/workspaces/:workspaceId/databases/:databaseId/reset-password", requireAuth, async (req, res): Promise<void> => {
  const databaseId = param(req.params.databaseId);
  const newPassword = generateDbPassword();

  const [database] = await db.update(workspaceDatabasesTable)
    .set({ dbPasswordEncrypted: encrypt(newPassword) })
    .where(eq(workspaceDatabasesTable.id, databaseId))
    .returning();

  if (!database) {
    res.status(404).json({ error: "Database not found" });
    return;
  }

  const connectionUrl = database.dbType === "postgres"
    ? `postgresql://${database.dbUser}:${newPassword}@${database.dbHost}:${database.dbPort}/${database.dbName}`
    : `mysql://${database.dbUser}:${newPassword}@${database.dbHost}:${database.dbPort}/${database.dbName}`;

  await db.update(workspaceDatabasesTable)
    .set({ connectionUrl })
    .where(eq(workspaceDatabasesTable.id, databaseId));

  res.json({
    id: database.id,
    workspaceId: database.workspaceId,
    dbType: database.dbType,
    dbName: database.dbName,
    dbUser: database.dbUser,
    dbHost: database.dbHost,
    dbPort: database.dbPort,
    dbPassword: newPassword,
    connectionUrl,
    createdAt: database.createdAt,
  });
});

export default router;
