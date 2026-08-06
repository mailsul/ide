import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/workspaces/:workspaceId/monitoring", requireAuth, async (_req, res): Promise<void> => {
  // Return simulated monitoring stats
  const cpuPercent = Math.random() * 30 + 5;
  const memoryMb = Math.floor(Math.random() * 256 + 64);
  const diskMb = Math.floor(Math.random() * 400 + 100);
  const networkIn = Math.floor(Math.random() * 1024 * 50);
  const networkOut = Math.floor(Math.random() * 1024 * 20);

  res.json({
    cpuPercent: Math.round(cpuPercent * 10) / 10,
    memoryMb,
    memoryLimitMb: 512,
    diskMb,
    diskLimitMb: 1024,
    networkIn,
    networkOut,
    uptime: Math.floor(Math.random() * 86400 * 3),
  });
});

export default router;
