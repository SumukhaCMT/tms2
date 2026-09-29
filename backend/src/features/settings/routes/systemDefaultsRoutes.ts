import { Router } from "express"

import { systemDefaultsController } from "../controllers/systemDefaultsController"

const router = Router()

router.get(
  "/",
  systemDefaultsController.getAll,
)

router.get(
  "/key/:key",
  systemDefaultsController.getByKey,
)

router.get(
  "/:id",
  systemDefaultsController.getById,
)

router.post(
  "/",
  systemDefaultsController.create,
)

router.put(
  "/:id",
  systemDefaultsController.update,
)

router.delete(
  "/:id",
  systemDefaultsController.delete,
)

export default router