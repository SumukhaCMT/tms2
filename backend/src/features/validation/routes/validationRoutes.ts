import { Router } from "express"
import { authenticate } from "../../../middleware/auth.middleware"
import { checkUnique } from "../controllers/validationController"

const router = Router()

router.get("/unique", authenticate, checkUnique)

export default router
