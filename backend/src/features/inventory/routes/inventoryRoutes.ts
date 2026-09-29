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

router.get("/inventory/temples", authenticate, asyncHandler(getInventoryTemples))
router.get("/inventory/current-temple", authenticate, asyncHandler(getInventoryCurrentTemple))
router.get("/inventory/item-types", authenticate, asyncHandler(getInventoryItemTypeOptionsController))
router.get("/inventory/given-by/search", authenticate, asyncHandler(getInventoryGivenBySuggestions))
router.get("/inventory/items/search", authenticate, asyncHandler(getInventoryItemSuggestions))
router.get("/inventory/measurements/units", authenticate, asyncHandler(getMeasurementUnits))
router.post("/inventory/measurements", authenticate, requirePermission("inventory", "ADD"), asyncHandler(postMeasurement))
router.get("/inventory", authenticate, asyncHandler(getInventoryList))
router.get("/inventory/:id", authenticate, asyncHandler(getInventoryById))
router.get("/inventory/:id/group", authenticate, asyncHandler(getInventoryGroupController))
router.get("/inventory/:id/receipt", authenticate, asyncHandler(getInventoryReceipt))
router.post("/inventory", authenticate, requirePermission("inventory", "ADD"), asyncHandler(postInventory))
router.put("/inventory/:id", authenticate, requirePermission("inventory", "EDIT"), asyncHandler(putInventory))
router.delete("/inventory/:id", authenticate, requirePermission("inventory", "DELETE"), asyncHandler(removeInventoryController))

export default router
