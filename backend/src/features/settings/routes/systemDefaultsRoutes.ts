import { Router } from "express"

import { systemDefaultsController } from "../controllers/systemDefaultsController"
import { loginImageController } from "../controllers/loginImageController"
import { authenticate, requirePermission } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { secureImageUpload } from "../../../utils/secureImage"

const router = Router()

router.get("/login-image", asyncHandler(loginImageController.get))

router.use(authenticate)

router.post("/login-image", requirePermission("settings", "EDIT"), secureImageUpload("image"), asyncHandler(loginImageController.upload))
router.delete("/login-image", requirePermission("settings", "EDIT"), asyncHandler(loginImageController.remove))

router.get("/", requirePermission("settings", "READ"), systemDefaultsController.getAll)
router.get("/key/:key", requirePermission("settings", "READ"), systemDefaultsController.getByKey)
router.get("/:id", requirePermission("settings", "READ"), systemDefaultsController.getById)
router.post("/", requirePermission("settings", "ADD"), systemDefaultsController.create)
router.put("/:id", requirePermission("settings", "EDIT"), systemDefaultsController.update)
router.delete("/:id", requirePermission("settings", "DELETE"), systemDefaultsController.delete)

export default router
