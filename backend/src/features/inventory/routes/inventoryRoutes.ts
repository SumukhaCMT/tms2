import { Router } from "express"

import {
  postInventory,
  getInventoryList,
  getInventoryById,
  putInventory,
  removeInventoryController,
  getInventoryTemples,
  getInventoryCurrentTemple,
  getInventoryItemTypeOptionsController,
  getInventoryGivenBySuggestions,
  getInventoryItemSuggestions,
  getInventoryReceipt,
  getInventoryGroupController,
} from "../controllers/inventoryController"

import { getMeasurementUnits, postMeasurement } from "../controllers/measurementController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"

const router = Router()

router.get("/inventory/temples", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryTemples))
router.get("/inventory/current-temple", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryCurrentTemple))
router.get("/inventory/item-types", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryItemTypeOptionsController))
router.get("/inventory/given-by/search", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryGivenBySuggestions))
router.get("/inventory/items/search", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryItemSuggestions))
router.get("/inventory/measurements/units", authenticate, requirePermission("inventory", "READ"), asyncHandler(getMeasurementUnits))
router.post("/inventory/measurements", authenticate, requirePermission("inventory", "ADD"), asyncHandler(postMeasurement))
router.get("/inventory", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryList))
router.get("/inventory/:id", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryById))
router.get("/inventory/:id/group", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryGroupController))
router.get("/inventory/:id/receipt", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryReceipt))
router.post("/inventory", authenticate, requirePermission("inventory", "ADD"), asyncHandler(postInventory))
router.put("/inventory/:id", authenticate, requirePermission("inventory", "EDIT"), asyncHandler(putInventory))
router.delete("/inventory/:id", authenticate, requirePermission("inventory", "DELETE"), asyncHandler(removeInventoryController))

export default router
