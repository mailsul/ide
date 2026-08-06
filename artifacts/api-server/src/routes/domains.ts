import { Router, type IRouter } from "express";
import { db, workspaceDomainsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

function toDomain(d: typeof workspaceDomainsTable.$inferSelect) {
  return {
    id: d.id,
    workspaceId: d.workspaceId,
    domain: d.domain,
    status: d.status,
    sslStatus: d.sslStatus,
    dnsRecord: {
      type: d.dnsRecordType,
      name: d.dnsRecordName,
      value: d.dnsRecordValue,
    },
    createdAt: d.createdAt,
  };
}

router.get("/workspaces/:workspaceId/domains", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const domains = await db.select().from(workspaceDomainsTable)
    .where(eq(workspaceDomainsTable.workspaceId, workspaceId));
  res.json(domains.map(toDomain));
});

router.post("/workspaces/:workspaceId/domains", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { domain } = req.body;

  if (!domain) {
    res.status(400).json({ error: "domain is required" });
    return;
  }

  const platformDomain = process.env.PLATFORM_DOMAIN || "localhost";
  const parts = (domain as string).split(".");
  const dnsName = parts.length > 2 ? parts[0] : "@";

  const [d] = await db.insert(workspaceDomainsTable).values({
    id: generateId("dom"),
    workspaceId,
    domain,
    status: "pending",
    sslStatus: "pending",
    dnsRecordType: "CNAME",
    dnsRecordName: dnsName,
    dnsRecordValue: platformDomain,
  }).returning();

  res.status(201).json(toDomain(d));
});

router.delete("/workspaces/:workspaceId/domains/:domainId", requireAuth, async (req, res): Promise<void> => {
  const domainId = param(req.params.domainId);
  await db.delete(workspaceDomainsTable).where(eq(workspaceDomainsTable.id, domainId));
  res.json({ success: true, message: "Domain removed" });
});

router.post("/workspaces/:workspaceId/domains/:domainId/verify", requireAuth, async (req, res): Promise<void> => {
  const domainId = param(req.params.domainId);

  const [d] = await db.update(workspaceDomainsTable)
    .set({ status: "active", sslStatus: "valid" })
    .where(eq(workspaceDomainsTable.id, domainId))
    .returning();

  if (!d) {
    res.status(404).json({ error: "Domain not found" });
    return;
  }

  res.json(toDomain(d));
});

export default router;
