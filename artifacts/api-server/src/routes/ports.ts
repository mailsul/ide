import { Router, type IRouter } from "express";
import { db, workspacePortsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

router.get("/workspaces/:workspaceId/ports", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const ports = await db.select().from(workspacePortsTable)
    .where(eq(workspacePortsTable.workspaceId, workspaceId));
  res.json(ports);
});

router.post("/workspaces/:workspaceId/ports", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { internalPort, name, isPrivate } = req.body;

  if (!internalPort || !name) {
    res.status(400).json({ error: "internalPort and name are required" });
    return;
  }

  const domain = process.env.PLATFORM_DOMAIN || "localhost";
  const [existing] = await db.select().from(workspacePortsTable)
    .where(and(
      eq(workspacePortsTable.workspaceId, workspaceId),
      eq(workspacePortsTable.internalPort, Number(internalPort))
    ));

  if (existing) {
    res.status(400).json({ error: "Port already exists" });
    return;
  }

  const [port] = await db.insert(workspacePortsTable).values({
    id: generateId("port"),
    workspaceId,
    internalPort: Number(internalPort),
    name,
    isPrivate: isPrivate || false,
    externalUrl: `https://ws-${workspaceId.slice(0, 8)}-${internalPort}.preview.${domain}`,
  }).returning();

  res.status(201).json(port);
});

router.delete("/workspaces/:workspaceId/ports/:portId", requireAuth, async (req, res): Promise<void> => {
  const portId = param(req.params.portId);
  await db.delete(workspacePortsTable).where(eq(workspacePortsTable.id, portId));
  res.json({ success: true, message: "Port removed" });
});

export default router;
