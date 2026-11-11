
import { Router } from "express";

import { authenticate, requirePermission } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { entityImageHandlers } from "../../../utils/entityImage";
import { secureImageUpload } from "../../../utils/secureImage";

import {
  createDeityController,
  deleteDeityController,
  getDeitiesController,
  getDeityController,
  updateDeityController,
} from "../controllers/deityController";

const router = Router();

const deityImage = entityImageHandlers({
  table: "deities",
  column: "deity_img_name",
  folder: "deity-images",
  prefix: "deity",
  label: "Deity",
});

router.use(authenticate);

router.get("/", requirePermission("Deities", "READ"), getDeitiesController);
router.get("/:id/image", requirePermission("Deities", "READ"), asyncHandler(deityImage.getImage));
router.post("/:id/image", requirePermission("Deities", ["ADD", "EDIT"]), secureImageUpload("image"), asyncHandler(deityImage.uploadImage));
router.delete("/:id/image", requirePermission("Deities", "EDIT"), asyncHandler(deityImage.deleteImage));
router.get("/:id", requirePermission("Deities", "READ"), getDeityController);
router.post("/", requirePermission("Deities", "ADD"), createDeityController);
router.put("/:id", requirePermission("Deities", "EDIT"), updateDeityController);
router.delete("/:id", requirePermission("Deities", "DELETE"), deleteDeityController);

export default router;