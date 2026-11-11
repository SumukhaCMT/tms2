import { Router } from "express"
import { authenticate, requirePermission } from "../../middleware/auth.middleware"
import { asyncHandler } from "../../utils/asyncHandler"
import { createContact, getContacts, updateContact } from "./contactController"

const router = Router()

router.use(authenticate)
router.get("/", requirePermission("contact", "READ"), asyncHandler(getContacts))
router.post("/", requirePermission("contact", "ADD"), asyncHandler(createContact))
router.patch("/:id/status", asyncHandler(updateContact))

export default router
