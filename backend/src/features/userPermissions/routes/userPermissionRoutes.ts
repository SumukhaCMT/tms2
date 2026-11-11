import { Router, type NextFunction, type Request, type Response } from "express"

import { authenticate } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { ORG_ADMIN_ROLE_ID } from "../../../utils/scope"

import { getUserPermissions, putUserPermissions } from "../controllers/userPermissionController"

const requireOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role_id !== ORG_ADMIN_ROLE_ID || !req.user.organization_id) {
    return res.status(403).json({ success: false, message: "Only organization admins can manage user permissions" })
  }
  next()
}

const router = Router()

router.use(authenticate, requireOrgAdmin)

router.get("/:userId", asyncHandler(getUserPermissions))
router.put("/:userId", asyncHandler(putUserPermissions))

export default router
