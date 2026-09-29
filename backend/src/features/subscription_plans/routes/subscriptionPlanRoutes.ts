import { Router } from "express";

import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlanById,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from "../controllers/subscriptionPlanController";

const router = Router();

router.post("/", createSubscriptionPlan);

router.get("/", getSubscriptionPlans);

router.get("/:id", getSubscriptionPlanById);

router.put("/:id", updateSubscriptionPlan);

router.delete("/:id", deleteSubscriptionPlan);

export default router;