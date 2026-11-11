import { Router } from "express"

import {
  getInventoryUsedItemOptions,
  getInventoryUsedStockSummary,
  postInventoryUsed,
  getInventoryUsedList,
  getInventoryUsedById,
  putInventoryUsed,
  removeInventoryUsedController,
} from "../controllers/inventoryUsedController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"

const router = Router()

router.get("/inventory-used/items", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryUsedItemOptions))
router.get("/inventory-used/items/:itemId/stock", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryUsedStockSummary))
router.get("/inventory-used", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryUsedList))
router.get("/inventory-used/:id", authenticate, requirePermission("inventory", "READ"), asyncHandler(getInventoryUsedById))
router.post("/inventory-used", authenticate, requirePermission("inventory", "ADD"), asyncHandler(postInventoryUsed))
router.put("/inventory-used/:id", authenticate, requirePermission("inventory", "EDIT"), asyncHandler(putInventoryUsed))
router.delete("/inventory-used/:id", authenticate, requirePermission("inventory", "DELETE"), asyncHandler(removeInventoryUsedController))

export default router
