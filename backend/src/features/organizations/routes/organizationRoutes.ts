import { Router } from "express"

import { organizationController } from "../controllers/organizationController"
import { authenticate, requirePermission } from "../../../middleware/auth.middleware"

const router = Router()

router.use(authenticate)

router.get("/", requirePermission("organizations", "READ"), organizationController.findAll)
router.get("/:id", requirePermission("organizations", "READ"), organizationController.findById)
router.post("/", requirePermission("organizations", "ADD"), organizationController.create)
router.put("/subscriptions/:id", requirePermission("organizations", "EDIT"), organizationController.updateSubscription)
router.put("/:id", requirePermission("organizations", "EDIT"), organizationController.update)
router.delete("/:id", requirePermission("organizations", "DELETE"), organizationController.delete)

export default router
