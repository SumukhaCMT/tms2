import { Router } from "express";
import {
  createSevaController,
  deleteSevaController,
  getSevaController,
  getSevasController,
  updateSevaController,
} from "../controllers/sevaController";
import { authenticate, requirePermission, scopeTemple } from "../../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission("sevas", "READ"), getSevasController);
router.get("/:id", requirePermission("sevas", "READ"), getSevaController);
router.post("/", requirePermission("sevas", "ADD"), scopeTemple, createSevaController);
router.put("/:id", requirePermission("sevas", "EDIT"), scopeTemple, updateSevaController);
router.delete("/:id", requirePermission("sevas", "DELETE"), deleteSevaController);

export default router;
