import { Router } from "express"

import {
  createSubModule,
  deleteSubModule,
  getSubModuleById,
  getSubModules,
  updateSubModule,
} from "../controllers/subModuleController"

import { validationMiddleware } from "../validations/validation"

import {
  createSubModuleSchema,
  updateSubModuleSchema,
} from "../validations/subModuleValidation"

const router = Router()

router.get("/", getSubModules)

router.get("/:id", getSubModuleById)

router.post(
  "/",
  validationMiddleware(createSubModuleSchema),
  createSubModule,
)

router.put(
  "/:id",
  validationMiddleware(updateSubModuleSchema),
  updateSubModule,
)

router.delete(
  "/:id",
  deleteSubModule,
)

export default router