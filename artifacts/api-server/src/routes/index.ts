import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import workspacesRouter from "./workspaces.js";
import filesRouter from "./files.js";
import portsRouter from "./ports.js";
import secretsRouter from "./secrets.js";
import workflowsRouter from "./workflows.js";
import databasesRouter from "./databases.js";
import domainsRouter from "./domains.js";
import monitoringRouter from "./monitoring.js";
import dashboardRouter from "./dashboard.js";
import adminRouter from "./admin.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(workspacesRouter);
router.use(filesRouter);
router.use(portsRouter);
router.use(secretsRouter);
router.use(workflowsRouter);
router.use(databasesRouter);
router.use(domainsRouter);
router.use(monitoringRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
