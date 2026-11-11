
import { Router } from "express";

import {
  createSevaBookingController,
  deleteSevaBookingController,
  getSevaBookingController,
  getSevaBookingsController,
  updateSevaBookingController,
  updateSevaBookingPaymentController,
  updateSevaBookingStatusController,
   printSevaBookingReceiptController,
   exportSevaBookingReportController,
} from "../controllers/sevaBookingController";

import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getSevaBookingsController);
router.get("/report/export", exportSevaBookingReportController);

router.get("/:id", getSevaBookingController);

router.post("/", createSevaBookingController);

router.put("/:id", updateSevaBookingController);

router.patch("/:id/payment", updateSevaBookingPaymentController);
router.patch("/:id/status", updateSevaBookingStatusController);

router.delete("/:id", deleteSevaBookingController);
router.get("/:id/receipt/print", printSevaBookingReceiptController);

export default router;
