
import { Router } from "express";

import {
  createTokenController,
  deleteTokenController,
  getTokenController,
  getTokensController,
  updateTokenController,
} from "../controllers/tokenController";

import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createTokenController);
router.get("/", getTokensController);
router.get("/:id", getTokenController);
router.put("/:id", updateTokenController);
router.delete("/:id", deleteTokenController);

export default router;
