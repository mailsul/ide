import { Router, type IRouter } from "express";
import { db, workspacesTable, usersTable, activityItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId, generateSlug } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

router.get("/workspaces", requireAuth, async (req, res): Promise<void> => {
  const workspaces = await db
    .select({
      id: workspacesTable.id,
      name: workspacesTable.name,
      slug: workspacesTable.slug,
      description: workspacesTable.description,
      language: workspacesTable.language,
      status: workspacesTable.status,
      isPublished: workspacesTable.isPublished,
      publishedUrl: workspacesTable.publishedUrl,
      devUrl: workspacesTable.devUrl,
      userId: workspacesTable.userId,
      createdAt: workspacesTable.createdAt,
      lastActive: workspacesTable.lastActive,
      username: usersTable.username,
    })
    .from(workspacesTable)
    .leftJoin(usersTable, eq(workspacesTable.userId, usersTable.id))
    .where(eq(workspacesTable.userId, req.user!.id));

  res.json(workspaces);
});

router.post("/workspaces", requireAuth, async (req, res): Promise<void> => {
  const { name, language, description } = req.body;
  if (!name || !language) {
    res.status(400).json({ error: "name and language are required" });
    return;
  }

  const slug = generateSlug(name);
  const id = generateId("ws");
  const domain = process.env.PLATFORM_DOMAIN || "localhost";

  const [workspace] = await db.insert(workspacesTable).values({
    id,
    userId: req.user!.id,
    name,
    slug,
    description: description || null,
    language,
    status: "stopped",
    isPublished: false,
    devUrl: `https://${slug}.preview.${domain}`,
  }).returning();

  await db.insert(activityItemsTable).values({
    id: generateId("act"),
    userId: req.user!.id,
    workspaceId: id,
    workspaceName: name,
    type: "workspace_created",
    message: `Workspace "${name}" created`,
  }).catch(() => {});

  res.status(201).json({ ...workspace, username: req.user!.username });
});

router.get("/workspaces/:workspaceId", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const [workspace] = await db
    .select({
      id: workspacesTable.id,
      name: workspacesTable.name,
      slug: workspacesTable.slug,
      description: workspacesTable.description,
      language: workspacesTable.language,
      status: workspacesTable.status,
      isPublished: workspacesTable.isPublished,
      publishedUrl: workspacesTable.publishedUrl,
      devUrl: workspacesTable.devUrl,
      userId: workspacesTable.userId,
      createdAt: workspacesTable.createdAt,
      lastActive: workspacesTable.lastActive,
      username: usersTable.username,
    })
    .from(workspacesTable)
    .leftJoin(usersTable, eq(workspacesTable.userId, usersTable.id))
    .where(and(
      eq(workspacesTable.id, workspaceId),
      eq(workspacesTable.userId, req.user!.id)
    ));

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  res.json(workspace);
});

router.patch("/workspaces/:workspaceId", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { name, description } = req.body;

  const [workspace] = await db
    .update(workspacesTable)
    .set({ name, description })
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)))
    .returning();

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  res.json({ ...workspace, username: req.user!.username });
});

router.delete("/workspaces/:workspaceId", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);

  const [workspace] = await db
    .delete(workspacesTable)
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)))
    .returning();

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  res.json({ success: true, message: "Workspace deleted" });
});

router.post("/workspaces/:workspaceId/start", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);

  const [workspace] = await db
    .update(workspacesTable)
    .set({ status: "running", lastActive: new Date() })
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)))
    .returning();

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  await db.insert(activityItemsTable).values({
    id: generateId("act"),
    userId: req.user!.id,
    workspaceId,
    workspaceName: workspace.name,
    type: "workspace_started",
    message: `Workspace "${workspace.name}" started`,
  }).catch(() => {});

  res.json({ ...workspace, username: req.user!.username });
});

router.post("/workspaces/:workspaceId/stop", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);

  const [workspace] = await db
    .update(workspacesTable)
    .set({ status: "stopped" })
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)))
    .returning();

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  await db.insert(activityItemsTable).values({
    id: generateId("act"),
    userId: req.user!.id,
    workspaceId,
    workspaceName: workspace.name,
    type: "workspace_stopped",
    message: `Workspace "${workspace.name}" stopped`,
  }).catch(() => {});

  res.json({ ...workspace, username: req.user!.username });
});

router.post("/workspaces/:workspaceId/publish", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const domain = process.env.PLATFORM_DOMAIN || "localhost";

  const [ws] = await db.select().from(workspacesTable)
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)));
  if (!ws) { res.status(404).json({ error: "Workspace not found" }); return; }

  const publishedUrl = `https://${ws.slug}.${domain}`;
  const [workspace] = await db
    .update(workspacesTable)
    .set({ isPublished: true, publishedUrl, status: "running" })
    .where(eq(workspacesTable.id, workspaceId))
    .returning();

  await db.insert(activityItemsTable).values({
    id: generateId("act"),
    userId: req.user!.id,
    workspaceId,
    workspaceName: workspace.name,
    type: "workspace_published",
    message: `Workspace "${workspace.name}" published at ${publishedUrl}`,
  }).catch(() => {});

  res.json({ ...workspace, username: req.user!.username });
});

router.post("/workspaces/:workspaceId/unpublish", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);

  const [workspace] = await db
    .update(workspacesTable)
    .set({ isPublished: false, publishedUrl: null })
    .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, req.user!.id)))
    .returning();

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  res.json({ ...workspace, username: req.user!.username });
});

export default router;
