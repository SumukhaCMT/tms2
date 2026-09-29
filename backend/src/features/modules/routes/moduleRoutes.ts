import { Router } from "express"

import {
  getModulesList,
  getModules,
  getModule,
  postModule,
  putModule,
  removeModule,
  getModulesForSidebar,
} from "../controllers/modulesController"

import { authenticate } from "../../../middleware/auth.middleware"


// const router = Router()
// // Get all modules
// router.get(
//   "/modules",
//   getModules,
// )

// // Get module by ID
// router.get(
//   "/modules/:id",
//   getModule,
// )
// // Create module
// router.post(
//   "/modules",
//   postModule,
// )

// // Update module
// router.put(
//   "/modules/:id",
//   putModule,
// )

// // Soft delete module
// router.delete(
//   "/modules/:id",
//   removeModule,
// )
// export default router

import {
  apiRateLimit,
  writeRateLimit,
} from "../../../middleware/rateLimitMiddleware"

const router = Router()

router.get(
  "/modules/sidebar",
  authenticate,
  getModulesForSidebar,
)

router.get(
  "/modulesList",
  getModulesList,
)

// GET modules
router.get(
  "/modules",
  apiRateLimit,
  getModules,
)

// GET module by ID
router.get(
  "/modules/:id",
  apiRateLimit,
  getModule,
)

// CREATE module
router.post(
  "/modules",
  writeRateLimit,
  postModule,
)

// UPDATE module
router.put(
  "/modules/:id",
  writeRateLimit,
  putModule,
)

// DELETE module
router.delete(
  "/modules/:id",
  writeRateLimit,
  removeModule,
)

export default router
