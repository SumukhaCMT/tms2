import { Router, type NextFunction, type Request, type Response } from "express"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import {
  acceptOrderController,
  createManualOrderController,
  getManualOrderController,
  getOrderAcknowledgementController,
  getManualOrderOptionsController,
  getManualOrdersController,
  getOrderDetailsController,
  getPendingOrdersController,
  rejectOrderController,
  updateManualOrderController,
} from "../controllers/orderRequestController"

const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.is_internal) {
    res.status(403).json({ success: false, message: "Only super admins can manage order requests" })
    return
  }
  next()
}

const router = Router()

router.use(authenticate, requireSuperAdmin)

router.get("/", requirePermission("manual_order", "READ"), asyncHandler(getPendingOrdersController))
router.get("/manual", requirePermission("manual_order", "READ"), asyncHandler(getManualOrdersController))
router.get("/manual/options", requirePermission("manual_order", "READ"), asyncHandler(getManualOrderOptionsController))
router.post("/manual", requirePermission("manual_order", "ADD"), asyncHandler(createManualOrderController))
router.get("/manual/:id", requirePermission("manual_order", "READ"), asyncHandler(getManualOrderController))
router.put("/manual/:id", requirePermission("manual_order", "EDIT"), asyncHandler(updateManualOrderController))
router.get("/:id", requirePermission("manual_order", "READ"), asyncHandler(getOrderDetailsController))
router.get("/:id/acknowledgement", requirePermission("manual_order", "READ"), asyncHandler(getOrderAcknowledgementController))
router.post("/:id/accept", requirePermission("manual_order", "EDIT"), asyncHandler(acceptOrderController))
router.post("/:id/reject", requirePermission("manual_order", "EDIT"), asyncHandler(rejectOrderController))

export default router
