import { Router } from "express"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { validationMiddleware } from "../../submodule/validations/validation"
import {
  activateCreditsController,
  addCartItemController,
  checkoutController,
  discardCartController,
  getCartController,
  getCreditsController,
  getExpiredController,
  getSubscriptionsController,
  getUpcomingController,
  removeCartItemController,
} from "../controllers/cartController"
import { addCartItemSchema, checkoutSchema } from "../validations/cartValidation"

const router = Router()

router.use(authenticate)

router.get("/", requirePermission("plans", "READ"), asyncHandler(getCartController))
router.delete("/", requirePermission("plans", "ADD"), asyncHandler(discardCartController))
router.post("/items", requirePermission("plans", "ADD"), validationMiddleware(addCartItemSchema), asyncHandler(addCartItemController))
router.delete("/items/:id", requirePermission("plans", "ADD"), asyncHandler(removeCartItemController))
router.post("/checkout", requirePermission("plans", "ADD"), validationMiddleware(checkoutSchema), asyncHandler(checkoutController))
router.get("/subscriptions", requirePermission(["plans", "subscriptions"], "READ"), asyncHandler(getSubscriptionsController))
router.get("/upcoming", requirePermission(["plans", "subscriptions"], "READ"), asyncHandler(getUpcomingController))
router.get("/expired", requirePermission("plans", "READ"), asyncHandler(getExpiredController))
router.get("/credits/:type", asyncHandler(getCreditsController))
router.post("/credits/:type/activate", asyncHandler(activateCreditsController))

export default router
