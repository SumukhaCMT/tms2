import { Router } from "express"

import { authenticate } from "../../middleware/auth.middleware"
import { asyncHandler } from "../../utils/asyncHandler"
import { getOrgDashboard } from "./dashboardController"

const router = Router()

router.use(authenticate)
router.get("/org", asyncHandler(getOrgDashboard))

export default router
