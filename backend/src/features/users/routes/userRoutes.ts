import { Router, type NextFunction, type Request, type Response } from "express"

import { authenticate } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { ORG_ADMIN_ROLE_ID } from "../../../utils/scope"

import {
  getMyProfile,
  getUser,
  getUserActivity,
  getUserLimit,
  getUserRoles,
  getUserStatuses,
  getUserTemples,
  getUsers,
  patchUserStatus,
  postUser,
  postUserTransfer,
  putUser,
  removeUser,
} from "../controllers/userController"

const requireOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role_id !== ORG_ADMIN_ROLE_ID || !req.user.organization_id) {
    return res.status(403).json({ success: false, message: "Only organization admins can manage users" })
  }
  next()
}

const router = Router()

router.get("/me", authenticate, asyncHandler(getMyProfile))

router.use(authenticate, requireOrgAdmin)

router.get("/", asyncHandler(getUsers))
router.get("/limit", asyncHandler(getUserLimit))
router.get("/temples", asyncHandler(getUserTemples))
router.get("/statuses", asyncHandler(getUserStatuses))
router.get("/roles", asyncHandler(getUserRoles))
router.get("/:id", asyncHandler(getUser))
router.get("/:id/activity", asyncHandler(getUserActivity))
router.post("/", asyncHandler(postUser))
router.put("/:id", asyncHandler(putUser))
router.post("/:id/transfer", asyncHandler(postUserTransfer))
router.patch("/:id/status", asyncHandler(patchUserStatus))
router.delete("/:id", asyncHandler(removeUser))

export default router
