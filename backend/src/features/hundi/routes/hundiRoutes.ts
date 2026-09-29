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
import { postMeasurement } from "../../inventory/controllers/measurementController"

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true)
      return
    }
    callback(new Error("Only JPEG or PNG images are allowed"))
  },
})

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true)
      return
    }
    callback(new Error("Only PDF files are allowed"))
  },
})

// Temples the caller may open a hundi at (org_admin picks one on the
// Basic Details step; other roles get an empty list back since they use
// their own session temple_id instead).
router.get("/hundi/temples", authenticate, getHundiTemples)

router.get("/hundi/witnesses/search", authenticate, asyncHandler(getWitnessSuggestions))

// Deities for the Basic Details step's multi-select, sourced from the
// `deities` table for the chosen temple.
router.get("/hundi/deities", authenticate, getHundiDeities)

// Cash denomination catalog for the Cash Denominations step.
router.get("/hundi/denominations", authenticate, getHundiDenominations)

// List hundi openings (scoped to the caller's organization/temple).
router.get("/hundi", authenticate, getHundis)

// Get a single hundi opening.
router.get("/hundi/:id", authenticate, getHundi)

// Acknowledgement receipt PDF - generates it on first request if one
// doesn't already exist on disk, then serves it.
router.get("/hundi/:id/receipt", authenticate, getHundiReceipt)

// Uploaded hundi photo.
router.get("/hundi/:id/image", authenticate, getHundiImage)
router.post("/hundi/measurements", authenticate, requirePermission("hundi", "ADD"), asyncHandler(postMeasurement))

router.post(
  "/hundi/:id/image",
  authenticate,
  requirePermission("hundi", "EDIT"),
  upload.single("hundi_image"),
  postHundiImage,
)

// Signed (physically witnessed) receipt PDF, uploaded after the fact —
// optional, never required to complete the hundi opening.
router.get("/hundi/:id/signed-receipt", authenticate, getHundiSignedReceipt)
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
  upload.single("hundi_image"),
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
