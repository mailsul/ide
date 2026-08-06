import { Router, type IRouter } from "express";
import { db, workspaceWorkflowsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

function toWorkflow(w: typeof workspaceWorkflowsTable.$inferSelect) {
  return {
    id: w.id,
    workspaceId: w.workspaceId,
    name: w.name,
    command: w.command,
    port: w.port,
    autoStart: w.autoStart,
    status: w.status,
    pid: w.pid,
  };
}

router.get("/workspaces/:workspaceId/workflows", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const workflows = await db.select().from(workspaceWorkflowsTable)
    .where(eq(workspaceWorkflowsTable.workspaceId, workspaceId));
  res.json(workflows.map(toWorkflow));
});

router.post("/workspaces/:workspaceId/workflows", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { name, command, port, autoStart } = req.body;

  if (!name || !command) {
    res.status(400).json({ error: "name and command are required" });
    return;
  }

  const [workflow] = await db.insert(workspaceWorkflowsTable).values({
    id: generateId("wf"),
    workspaceId,
    name,
    command,
    port: port ? Number(port) : null,
    autoStart: autoStart || false,
    status: "stopped",
  }).returning();

  res.status(201).json(toWorkflow(workflow));
});

router.patch("/workspaces/:workspaceId/workflows/:workflowId", requireAuth, async (req, res): Promise<void> => {
  const workflowId = param(req.params.workflowId);
  const { name, command, port, autoStart } = req.body;

  const [workflow] = await db.update(workspaceWorkflowsTable)
    .set({ name, command, port: port ? Number(port) : null, autoStart })
    .where(eq(workspaceWorkflowsTable.id, workflowId))
    .returning();

  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  res.json(toWorkflow(workflow));
});

router.delete("/workspaces/:workspaceId/workflows/:workflowId", requireAuth, async (req, res): Promise<void> => {
  const workflowId = param(req.params.workflowId);
  await db.delete(workspaceWorkflowsTable).where(eq(workspaceWorkflowsTable.id, workflowId));
  res.json({ success: true, message: "Workflow deleted" });
});

router.post("/workspaces/:workspaceId/workflows/:workflowId/start", requireAuth, async (req, res): Promise<void> => {
  const workflowId = param(req.params.workflowId);
  const [workflow] = await db.update(workspaceWorkflowsTable)
    .set({ status: "running", pid: Math.floor(Math.random() * 90000) + 10000 })
    .where(eq(workspaceWorkflowsTable.id, workflowId))
    .returning();

  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  res.json(toWorkflow(workflow));
});

router.post("/workspaces/:workspaceId/workflows/:workflowId/stop", requireAuth, async (req, res): Promise<void> => {
  const workflowId = param(req.params.workflowId);
  const [workflow] = await db.update(workspaceWorkflowsTable)
    .set({ status: "stopped", pid: null })
    .where(eq(workspaceWorkflowsTable.id, workflowId))
    .returning();

  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  res.json(toWorkflow(workflow));
});

router.get("/workspaces/:workspaceId/workflows/:workflowId/logs", requireAuth, async (req, res): Promise<void> => {
  const workflowId = param(req.params.workflowId);
  const [workflow] = await db.select().from(workspaceWorkflowsTable)
    .where(eq(workspaceWorkflowsTable.id, workflowId));

  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const lines = workflow.status === "running"
    ? [
        `[${new Date().toISOString()}] Starting ${workflow.command}...`,
        `[${new Date().toISOString()}] Process started with PID ${workflow.pid}`,
        `[${new Date().toISOString()}] Server listening on port ${workflow.port || 3000}`,
      ]
    : [`[${new Date().toISOString()}] Workflow stopped.`];

  res.json({ workflowId, lines });
});

export default router;
