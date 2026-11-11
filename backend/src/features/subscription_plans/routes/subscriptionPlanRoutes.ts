import { Router } from "express";

import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlanById,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from "../controllers/subscriptionPlanController";

import { authenticate, requirePermission } from "../../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getSubscriptionPlans);
router.get("/:id", getSubscriptionPlanById);
router.post("/", requirePermission("subscriptionplans", "ADD"), createSubscriptionPlan);
router.put("/:id", requirePermission("subscriptionplans", "EDIT"), updateSubscriptionPlan);
router.delete("/:id", requirePermission("subscriptionplans", "DELETE"), deleteSubscriptionPlan);

export default router;
