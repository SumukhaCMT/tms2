import { Router } from "express"

import {
  createSubModule,
  deleteSubModule,
  getSubModuleById,
  getSubModules,
  updateSubModule,
} from "../controllers/subModuleController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { validationMiddleware } from "../validations/validation"
import { createSubModuleSchema, updateSubModuleSchema } from "../validations/subModuleValidation"

const router = Router()

router.use(authenticate)

router.get("/", getSubModules)
router.get("/:id", getSubModuleById)
router.post("/", requirePermission("submodules", "ADD"), validationMiddleware(createSubModuleSchema), createSubModule)
router.put("/:id", requirePermission("submodules", "EDIT"), validationMiddleware(updateSubModuleSchema), updateSubModule)
router.delete("/:id", requirePermission("submodules", "DELETE"), deleteSubModule)

export default router
