import { Router } from "express"

import { authenticate } from "../../middleware/auth.middleware"
import { asyncHandler } from "../../utils/asyncHandler"
import { amcRepository } from "./amcRepository"

const router = Router()

router.get(
  "/due",
  authenticate,
  asyncHandler(async (req, res) => {
    const organizationId = Number(req.user?.organization_id)

    if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
      res.status(403).json({ success: false, message: "Organization not found" })
      return
    }

    res.status(200).json({ success: true, data: await amcRepository.listDue(organizationId) })
  }),
)

export default router
