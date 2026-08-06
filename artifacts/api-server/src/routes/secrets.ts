import { Router, type IRouter } from "express";
import { db, workspaceSecretsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId, encrypt } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

router.get("/workspaces/:workspaceId/secrets", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const secrets = await db.select({
    id: workspaceSecretsTable.id,
    workspaceId: workspaceSecretsTable.workspaceId,
    key: workspaceSecretsTable.key,
    createdAt: workspaceSecretsTable.createdAt,
  }).from(workspaceSecretsTable)
    .where(eq(workspaceSecretsTable.workspaceId, workspaceId));
  res.json(secrets);
});

router.post("/workspaces/:workspaceId/secrets", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { key, value } = req.body;

  if (!key || value == null) {
    res.status(400).json({ error: "key and value are required" });
    return;
  }

  const [secret] = await db.insert(workspaceSecretsTable).values({
    id: generateId("sec"),
    workspaceId,
    key,
    valueEncrypted: encrypt(String(value)),
  }).returning();

  res.status(201).json({
    id: secret.id,
    workspaceId: secret.workspaceId,
    key: secret.key,
    createdAt: secret.createdAt,
  });
});

router.patch("/workspaces/:workspaceId/secrets/:secretId", requireAuth, async (req, res): Promise<void> => {
  const secretId = param(req.params.secretId);
  const { value } = req.body;

  if (value == null) {
    res.status(400).json({ error: "value is required" });
    return;
  }

  const [secret] = await db.update(workspaceSecretsTable)
    .set({ valueEncrypted: encrypt(String(value)) })
    .where(eq(workspaceSecretsTable.id, secretId))
    .returning();

  if (!secret) {
    res.status(404).json({ error: "Secret not found" });
    return;
  }

  res.json({
    id: secret.id,
    workspaceId: secret.workspaceId,
    key: secret.key,
    createdAt: secret.createdAt,
  });
});

router.delete("/workspaces/:workspaceId/secrets/:secretId", requireAuth, async (req, res): Promise<void> => {
  const secretId = param(req.params.secretId);
  await db.delete(workspaceSecretsTable).where(eq(workspaceSecretsTable.id, secretId));
  res.json({ success: true, message: "Secret deleted" });
});

export default router;
