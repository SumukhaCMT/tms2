import { Router } from "express"

import {
  getIncompleteHundis,
  getHundiBankDeposits,
  getHundiBankDepositByIdController,
  postHundiBankDeposit,
  putHundiBankDeposit,
  deleteHundiBankDepositController,
  getIfscLookup,
  getDepositedBySearch,
} from "../controllers/hundiBankDepositController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"

const router = Router()

router.get("/hundi-tracking/incomplete-hundis", authenticate, requirePermission("hundi", "READ"), getIncompleteHundis)

router.get("/hundi-tracking/deposited-by/search", authenticate, requirePermission("hundi", "READ"), getDepositedBySearch)

router.get("/hundi-tracking/ifsc/:code", authenticate, requirePermission("hundi", "READ"), getIfscLookup)

router.get("/hundi-tracking", authenticate, requirePermission("hundi", "READ"), getHundiBankDeposits)

router.post(
  "/hundi-tracking",
  authenticate,
  requirePermission("hundi", "ADD"),
  postHundiBankDeposit,
)

router.get("/hundi-tracking/:id", authenticate, requirePermission("hundi", "READ"), getHundiBankDepositByIdController)

router.put(
  "/hundi-tracking/:id",
  authenticate,
  requirePermission("hundi", "EDIT"),
  putHundiBankDeposit,
)

router.delete(
  "/hundi-tracking/:id",
  authenticate,
  requirePermission("hundi", "DELETE"),
  deleteHundiBankDepositController,
)

export default router
