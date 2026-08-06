import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, workspacesTable, platformSettingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const result = await Promise.all(users.map(async (u) => {
    const [{ wsCount }] = await db.select({ wsCount: count() }).from(workspacesTable)
      .where(eq(workspacesTable.userId, u.id));
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      plan: u.plan,
      workspaceCount: Number(wsCount),
      createdAt: u.createdAt,
    };
  }));
  res.json(result);
});

router.post("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const { username, fullName, email, password, role, plan } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: "username, email and password are required" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    id: generateId("usr"),
    username,
    fullName: fullName || null,
    email,
    passwordHash,
    role: role || "user",
    plan: plan || "free",
    onboardingCompleted: false,
  }).returning();

  res.status(201).json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    plan: user.plan,
    workspaceCount: 0,
    createdAt: user.createdAt,
  });
});

router.patch("/admin/users/:userId", requireAdmin, async (req, res): Promise<void> => {
  const userId = param(req.params.userId);
  const { role, plan, password } = req.body;

  const updates: Record<string, unknown> = {};
  if (role) updates.role = role;
  if (plan) updates.plan = plan;
  if (password) updates.passwordHash = await bcrypt.hash(password as string, 12);

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [{ wsCount }] = await db.select({ wsCount: count() }).from(workspacesTable)
    .where(eq(workspacesTable.userId, user.id));

  res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    plan: user.plan,
    workspaceCount: Number(wsCount),
    createdAt: user.createdAt,
  });
});

router.delete("/admin/users/:userId", requireAdmin, async (req, res): Promise<void> => {
  const userId = param(req.params.userId);
  if (userId === req.user!.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.json({ success: true, message: "User deleted" });
});

router.get("/admin/workspaces", requireAdmin, async (_req, res): Promise<void> => {
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
    .leftJoin(usersTable, eq(workspacesTable.userId, usersTable.id));

  res.json(workspaces);
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
  const [{ totalWorkspaces }] = await db.select({ totalWorkspaces: count() }).from(workspacesTable);
  const workspaces = await db.select({
    status: workspacesTable.status,
    isPublished: workspacesTable.isPublished,
  }).from(workspacesTable);

  res.json({
    totalUsers: Number(totalUsers),
    totalWorkspaces: Number(totalWorkspaces),
    runningWorkspaces: workspaces.filter(w => w.status === "running").length,
    publishedWorkspaces: workspaces.filter(w => w.isPublished).length,
    totalDatabases: 0,
  });
});

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(platformSettingsTable)
    .where(eq(platformSettingsTable.id, "singleton"));
  if (!settings) {
    const [newSettings] = await db.insert(platformSettingsTable).values({
      id: "singleton",
      platformName: "DevSpace",
      domain: process.env.PLATFORM_DOMAIN || "localhost",
      registrationEnabled: false,
      defaultPlan: "free",
      maxWorkspacesPerUser: 5,
      maxRamMb: 512,
      maxDiskMb: 1024,
    }).returning();
    res.json(newSettings);
    return;
  }
  res.json(settings);
});

router.patch("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const { platformName, domain, registrationEnabled, defaultPlan, maxWorkspacesPerUser, maxRamMb, maxDiskMb } = req.body;

  const existing = await db.select().from(platformSettingsTable)
    .where(eq(platformSettingsTable.id, "singleton"));

  let settings;
  if (existing.length === 0) {
    [settings] = await db.insert(platformSettingsTable).values({
      id: "singleton",
      platformName: platformName || "DevSpace",
      domain: domain || "localhost",
      registrationEnabled: registrationEnabled ?? false,
      defaultPlan: defaultPlan || "free",
      maxWorkspacesPerUser: maxWorkspacesPerUser || 5,
      maxRamMb: maxRamMb || 512,
      maxDiskMb: maxDiskMb || 1024,
    }).returning();
  } else {
    [settings] = await db.update(platformSettingsTable)
      .set({ platformName, domain, registrationEnabled, defaultPlan, maxWorkspacesPerUser, maxRamMb, maxDiskMb, updatedAt: new Date() })
      .where(eq(platformSettingsTable.id, "singleton"))
      .returning();
  }

  res.json(settings);
});

export default router;
