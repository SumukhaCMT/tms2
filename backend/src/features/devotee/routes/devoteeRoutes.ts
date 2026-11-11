
import { Router } from "express";

import {
  getDevoteeController,
  getDevoteesController,
  searchDevoteesController,
  updateDevoteeController,
  deleteDevoteeController,
} from "../controllers/devoteeController";

import {
  authenticate,
  // requirePermission,
} from "../../../middleware/auth.middleware";

const router = Router();

// Authentication for all devotee routes
router.use(authenticate);

// GET /api/v1/devotees
router.get(
  "/",

  getDevoteesController,
);

// GET /api/v1/devotees/search?search=...
// Keep before /:id
router.get(
  "/search",
  // requirePermission("devotees", "READ"),
  searchDevoteesController,
);

// GET /api/v1/devotees/:id
router.get(
  "/:id",
  // requirePermission("devotees", "READ"),
  getDevoteeController,
);

// PUT /api/v1/devotees/:id
router.put(
  "/:id",
  // requirePermission("devotees", "EDIT"),
  updateDevoteeController,
);
router.delete(
  "/:id",
  // requirePermission("devotees", "DELETE"),
  deleteDevoteeController,
);

export default router;