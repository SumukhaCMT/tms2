import { Router } from "express"

import {
  createTempleController,
  deleteTempleController,
  getTempleController,
  getTempleLimitController,
  getTemplesController,
  updateTempleController,
} from "../controllers/templeController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { entityImageHandlers } from "../../../utils/entityImage"
import { secureImageUpload } from "../../../utils/secureImage"

const router = Router()

const templeImage = entityImageHandlers({
  table: "temples",
  column: "temp_img_name",
  folder: "temple-images",
  prefix: "temple",
  label: "Temple",
})

router.use(authenticate)

router.post(
  "/",
  requirePermission("temples", "ADD"),
  createTempleController,
)

router.get(
  "/",
  getTemplesController,
)

router.get(
  "/limit",
  getTempleLimitController,
)

router.get(
  "/:id/image",
  requirePermission("temples", "READ"),
  asyncHandler(templeImage.getImage),
)

router.post(
  "/:id/image",
  requirePermission("temples", ["ADD", "EDIT"]),
  secureImageUpload("image"),
  asyncHandler(templeImage.uploadImage),
)

router.delete(
  "/:id/image",
  requirePermission("temples", "EDIT"),
  asyncHandler(templeImage.deleteImage),
)

router.get(
  "/:id",
  getTempleController,
)

router.put(
  "/:id",
  requirePermission("temples", "EDIT"),
  updateTempleController,
)

router.delete(
  "/:id",
  requirePermission("temples", "DELETE"),
  deleteTempleController,
)

export default router

