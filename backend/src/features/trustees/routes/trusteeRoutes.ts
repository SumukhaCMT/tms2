import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware"

import {
  getTrustees,
  getTrusteeById,
  createTrustee,
  updateTrustee,
  deleteTrustee,
} from "../controllers/trusteeController";

const router = Router();

router.use(authenticate);

router.get("/", getTrustees);
router.get("/:id", getTrusteeById);
router.post("/", createTrustee);
router.put("/:id", updateTrustee);
router.delete("/:id", deleteTrustee);

export default router;