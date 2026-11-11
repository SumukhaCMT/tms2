import { Router } from "express"

import {
  postDefineHundi,
  getDefineHundis,
  putDefineHundi,
  removeDefineHundiController,
  getDefineHundiTemples,
  getDefineHundiDeities,
} from "../controllers/defineHundiController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"

const router = Router()


router.get("/define-hundi/temples", authenticate, requirePermission("hundi", "READ"), getDefineHundiTemples)

// Deities for the chosen temple, to pick which deity a hundi belongs to.
router.get("/define-hundi/deities", authenticate, requirePermission("hundi", "READ"), getDefineHundiDeities)

// List defined hundis (the master list of physical hundi boxes).
router.get("/define-hundi", authenticate, requirePermission("hundi", "READ"), getDefineHundis)

// Define a new hundi (Temple, Deity, Hundi Number, Hundi Name).
router.post(
  "/define-hundi",
  authenticate,
  requirePermission("hundi", "ADD"),
  postDefineHundi,
)

// Update a defined hundi.
router.put(
  "/define-hundi/:id",
  authenticate,
  requirePermission("hundi", "EDIT"),
  putDefineHundi,
)

// Delete a defined hundi.
router.delete(
  "/define-hundi/:id",
  authenticate,
  requirePermission("hundi", "DELETE"),
  removeDefineHundiController,
)

export default router
