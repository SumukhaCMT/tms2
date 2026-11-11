import { Router } from "express"

import { authenticate } from "../../middleware/auth.middleware"
import { secureImageUpload } from "../../utils/secureImage"

const router = Router()

router.post("/scan", authenticate, secureImageUpload("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Image is required" })
    return
  }

  res.setHeader("Cache-Control", "no-store")
  res.type("image/webp").send(req.file.buffer)
})

export default router
