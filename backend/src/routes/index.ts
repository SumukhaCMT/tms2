import { Router } from "express"
import { httpsRedirect } from "../middleware/httpsRedirect.middleware";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from '../features/auth/routes/auth.routes';
// import organizationRoutes from "../features/organizations/routes/organizationRoutes"
import moduleRoutes from "../features/modules/routes/moduleRoutes"
import donationRoutes from "../features/donations/routes/donationRoutes"
import hundiRoutes from "../features/hundi/routes/hundiRoutes"
import defineHundiRoutes from "../features/hundi/routes/defineHundiRoutes"
import hundiBankDepositRoutes from "../features/hundi/routes/hundiBankDepositRoutes"
import inventoryRoutes from "../features/inventory/routes/inventoryRoutes"
import inventoryUsedRoutes from "../features/inventory/routes/inventoryUsedRoutes"

import subModuleRoutes from "../features/submodule/routes/subModuleRoutes"
import subscriptionPlanRoutes from "../features/subscription_plans/routes/subscriptionPlanRoutes";
import subscriptionBundleRoutes from "../features/subscription_bundles/routes/subscriptionBundleRoutes";
import organizationRoutes from "../features/organizations/routes/organizationRoutes"
import systemDefaultsRoutes from "../features/settings/routes/systemDefaultsRoutes"
import roleRoutes from "../features/role/routes/roleRoutes"
const router = Router()

router.use(httpsRedirect);
router.use(cors({ origin: process.env.CLIENT_URL, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true }));
router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use('/auth', authRoutes);
router.use('/v1', donationRoutes)
router.use('/v1', hundiRoutes)
router.use('/v1', defineHundiRoutes)
router.use('/v1', hundiBankDepositRoutes)
router.use('/v1', inventoryRoutes)
router.use('/v1', inventoryUsedRoutes)

// Admin routes: the frontend calls these both with and without the /v1 prefix,
// so mount them under both.
for (const prefix of ["", "/v1"]) {
  router.use(prefix || "/", moduleRoutes)
  router.use(`${prefix}/sub-modules`, subModuleRoutes)
  router.use(`${prefix}/subscription-plans`, subscriptionPlanRoutes)
  router.use(`${prefix}/subscription-bundles`, subscriptionBundleRoutes)
  router.use(`${prefix}/organizations`, organizationRoutes)
  router.use(`${prefix}/system-defaults`, systemDefaultsRoutes)
  router.use(`${prefix}/roles`, roleRoutes)
}

// Hundi/donation forms call /v1/organization/organizations/:id
router.use("/v1/organization/organizations", organizationRoutes)

export default router
