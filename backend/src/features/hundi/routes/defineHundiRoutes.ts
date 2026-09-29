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

// Temples the caller may define a hundi for (org_admin picks one; other
// roles get an empty list back since they use their own session
// temple_id instead).
router.get("/define-hundi/temples", authenticate, getDefineHundiTemples)

// Deities for the chosen temple, to pick which deity a hundi belongs to.
router.get("/define-hundi/deities", authenticate, getDefineHundiDeities)

// List defined hundis (the master list of physical hundi boxes).
router.get("/define-hundi", authenticate, getDefineHundis)

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
