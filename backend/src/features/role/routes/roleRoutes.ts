import { Router } from "express"

import {
  createRoleController,
  getRolesController,
  getRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controllers/roleController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"

const router = Router()

router.use(authenticate)

router.get("/", requirePermission("roles", "READ"), getRolesController)
router.get("/:id", requirePermission("roles", "READ"), getRoleController)
router.post("/", requirePermission("roles", "ADD"), createRoleController)
router.put("/:id", requirePermission("roles", "EDIT"), updateRoleController)
router.delete("/:id", requirePermission("roles", "DELETE"), deleteRoleController)

export default router
