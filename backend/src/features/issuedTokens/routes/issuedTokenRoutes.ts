
import { Router } from "express";
import { createIssuedTokenController, getIssuedTokenController, getIssuedTokensController, printIssuedTokenController } from "../controllers/issuedTokenController";
import { authenticate } from "../../../middleware/auth.middleware";
const router = Router();
router.use(authenticate);
router.post("/", createIssuedTokenController);
router.get("/", getIssuedTokensController);
router.get("/:id", getIssuedTokenController);

router.get(
  "/:id/print",

  printIssuedTokenController,
);

export default router;