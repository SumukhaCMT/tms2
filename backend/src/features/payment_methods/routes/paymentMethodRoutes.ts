import { Router } from "express";

import {
  createPaymentMethodController,
  deletePaymentMethodController,
  getPaymentMethodController,
  getPaymentMethodsController,
  updatePaymentMethodController,
} from "../controllers/paymentMethodController";

import { authenticate, requirePermission } from "../../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("payment_methods", "READ"),
  getPaymentMethodsController
);

router.get(
  "/:id",
  authenticate,
  requirePermission("payment_methods", "READ"),
  getPaymentMethodController
);

router.post(
  "/",
  authenticate,
  requirePermission("payment_methods", "ADD"),
  createPaymentMethodController
);

router.put(
  "/:id",
  authenticate,
  requirePermission("payment_methods", "EDIT"),
  updatePaymentMethodController
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("payment_methods", "DELETE"),
  deletePaymentMethodController
);

export default router;