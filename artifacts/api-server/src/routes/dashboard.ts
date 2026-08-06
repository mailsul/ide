import { Router, type IRouter } from "express";
import { db, workspacesTable, workspaceDatabasesTable, activityItemsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

  const [{ total }] = await db.select({ total: count() }).from(workspacesTable)
    .where(eq(workspacesTable.userId, userId));

  const workspaces = await db.select().from(workspacesTable)
    .where(eq(workspacesTable.userId, userId));

  const runningWorkspaces = workspaces.filter(w => w.status === "running").length;
  const publishedWorkspaces = workspaces.filter(w => w.isPublished).length;

  // Count databases across all user workspaces
  let totalDatabases = 0;
  for (const ws of workspaces) {
    const [{ dbCount }] = await db.select({ dbCount: count() }).from(workspaceDatabasesTable)
      .where(eq(workspaceDatabasesTable.workspaceId, ws.id));
    totalDatabases += Number(dbCount);
  }

  const totalWorkspaces = Number(total);
  const onboardingProgress = {
    accountCreated: true,
    firstWorkspaceCreated: totalWorkspaces > 0,
    codeRan: runningWorkspaces > 0,
    websitePublished: publishedWorkspaces > 0,
    customDomainConnected: false,
    percentage: Math.round(
      ([true, totalWorkspaces > 0, runningWorkspaces > 0, publishedWorkspaces > 0, false]
        .filter(Boolean).length / 5) * 100
    ),
  };

  res.json({
    totalWorkspaces,
    runningWorkspaces,
    publishedWorkspaces,
    totalDatabases,
    onboardingProgress,
  });
});

router.get("/dashboard/activity", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const items = await db.select().from(activityItemsTable)
    .where(eq(activityItemsTable.userId, userId));

  // Sort by createdAt desc, limit 20
  const sorted = items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  res.json(sorted.map(item => ({
    id: item.id,
    type: item.type,
    workspaceName: item.workspaceName,
    workspaceId: item.workspaceId,
    message: item.message,
    createdAt: item.createdAt,
  })));
});

export default router;
