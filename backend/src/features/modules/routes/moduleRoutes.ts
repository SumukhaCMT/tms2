import { Router } from "express"

import {
  getModulesList,
  getModules,
  getModule,
  postModule,
  putModule,
  removeModule,
  getModulesForSidebar,
} from "../controllers/modulesController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { writeRateLimit } from "../../../middleware/rateLimitMiddleware"
import { validationMiddleware } from "../../submodule/validations/validation"
import { moduleSchema } from "../validations/moduleValidation"

const router = Router()

router.get("/modules/sidebar", authenticate, getModulesForSidebar)
router.get("/modulesList", authenticate, getModulesList)
router.get("/modules", authenticate, requirePermission("modules", "READ"), getModules)
router.get("/modules/:id", authenticate, requirePermission("modules", "READ"), getModule)
router.post("/modules", writeRateLimit, authenticate, requirePermission("modules", "ADD"), validationMiddleware(moduleSchema), postModule)
router.put("/modules/:id", writeRateLimit, authenticate, requirePermission("modules", "EDIT"), validationMiddleware(moduleSchema), putModule)
router.delete("/modules/:id", writeRateLimit, authenticate, requirePermission("modules", "DELETE"), removeModule)

export default router
