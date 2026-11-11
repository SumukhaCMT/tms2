import { Router } from "express";

import controller from "../controllers/subscriptionBundleController";
import { authenticate, requirePermission } from "../../../middleware/auth.middleware";
import { validationMiddleware } from "../../submodule/validations/validation";
import { subscriptionBundleSchema, updateSubscriptionBundleSchema } from "../validations/subscriptionBundleValidation";

const router = Router();

router.use(authenticate);

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", requirePermission("subscription_bundles", "ADD"), validationMiddleware(subscriptionBundleSchema), controller.create.bind(controller));
router.put("/:id", requirePermission("subscription_bundles", "EDIT"), validationMiddleware(updateSubscriptionBundleSchema), controller.update.bind(controller));
router.delete("/:id", requirePermission("subscription_bundles", "DELETE"), controller.delete.bind(controller));

export default router;
