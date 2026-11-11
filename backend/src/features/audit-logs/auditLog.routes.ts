import { Router } from "express";
import { listAuditLogs } from "./auditLog.controller";

// Replace this import with your existing authentication middleware.
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Protect this endpoint with authentication AND your project's
// permission middleware for audit-log viewing.
router.get("/", authenticate, listAuditLogs);

export default router;