import { Router } from "express"
import multer from "multer"

import {
  postHundi,
  putHundi,
  getHundis,
  getHundi,
  removeHundiController,
  getHundiTemples,
  getHundiDeities,
  getHundiDenominations,
  getHundiReceipt,
  getHundiImage,
  postHundiImage,
  postHundiSignedReceipt,
  getHundiSignedReceipt,
  getWitnessSuggestions,
} from "../controllers/hundiController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { secureImageUpload } from "../../../utils/secureImage"
import { postMeasurement } from "../../inventory/controllers/measurementController"

const router = Router()

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true)
      return
    }
    callback(new Error("Only PDF files are allowed"))
  },
})

router.get("/hundi/temples", authenticate, requirePermission("hundi", "READ"), getHundiTemples)

router.get("/hundi/witnesses/search", authenticate, requirePermission("hundi", "READ"), asyncHandler(getWitnessSuggestions))

router.get("/hundi/deities", authenticate, requirePermission("hundi", "READ"), getHundiDeities)

// Cash denomination catalog for the Cash Denominations step.
router.get("/hundi/denominations", authenticate, requirePermission("hundi", "READ"), getHundiDenominations)

// List hundi openings (scoped to the caller's organization/temple).
router.get("/hundi", authenticate, requirePermission("hundi", "READ"), getHundis)

// Get a single hundi opening.
router.get("/hundi/:id", authenticate, requirePermission("hundi", "READ"), getHundi)

// Acknowledgement receipt PDF - generates it on first request if one
// doesn't already exist on disk, then serves it.
router.get("/hundi/:id/receipt", authenticate, requirePermission("hundi", "READ"), getHundiReceipt)

// Uploaded hundi photo.
router.get("/hundi/:id/image", authenticate, requirePermission("hundi", "READ"), getHundiImage)
router.post("/hundi/measurements", authenticate, requirePermission("hundi", "ADD"), asyncHandler(postMeasurement))

router.post(
  "/hundi/:id/image",
  authenticate,
  requirePermission("hundi", "EDIT"),
  secureImageUpload("hundi_image"),
  postHundiImage,
)

// Signed (physically witnessed) receipt PDF, uploaded after the fact —
// optional, never required to complete the hundi opening.
router.get("/hundi/:id/signed-receipt", authenticate, requirePermission("hundi", "READ"), getHundiSignedReceipt)
router.post(
  "/hundi/:id/signed-receipt",
  authenticate,
  requirePermission("hundi", "EDIT"),
  uploadPdf.single("signed_receipt"),
  postHundiSignedReceipt,
)

// Create hundi opening(s) (the full wizard submit) - one hundi row per
// deity selected that has an active Hundi defined for it.
router.post(
  "/hundi",
  authenticate,
  requirePermission("hundi", "ADD"),
  secureImageUpload("hundi_image"),
  postHundi,
)

// Update a hundi opening's witness / denominations / item / remarks —
// Basic Details (opened_at, temple, deity) are fixed at creation.
router.put(
  "/hundi/:id",
  authenticate,
  requirePermission("hundi", "EDIT"),
  putHundi,
)

// Delete a hundi opening.
router.delete(
  "/hundi/:id",
  authenticate,
  requirePermission("hundi", "DELETE"),
  removeHundiController,
)

export default router
