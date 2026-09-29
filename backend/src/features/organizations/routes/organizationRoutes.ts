import { Router } from "express"

import {
  organizationController,
} from "../controllers/organizationController"

const router = Router()

// ============================================================
// ORGANIZATION CRUD
// ============================================================

// GET /api/v1/organizations
router.get(
  "/",
  organizationController.findAll,
)

// GET /api/v1/organizations/:id
router.get(
  "/:id",
  organizationController.findById,
)

// POST /api/v1/organizations
router.post(
  "/",
  organizationController.create,
)

// PUT /api/v1/organizations/:id
// router.put(
//   "/:id",
//   organizationController.update,
// )
router.put(
  "/subscriptions/:id",
  organizationController.updateSubscription,
)

router.put(
  "/:id",
  organizationController.update,
)
// DELETE /api/v1/organizations/:id
router.delete(
  "/:id",
  organizationController.delete,
)

export default router