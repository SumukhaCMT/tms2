import {
  Router,
} from "express"

import {
  createRoleController,
  getRolesController,
  getRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controllers/roleController"


const router = Router()


/* =========================================================
   CREATE ROLE
   POST /api/v1/roles
========================================================= */

router.post(
  "/",
  createRoleController,
)


/* =========================================================
   GET ALL ROLES
   GET /api/v1/roles
========================================================= */

router.get(
  "/",
  getRolesController,
)


/* =========================================================
   GET ROLE BY ID
   GET /api/v1/roles/:id
========================================================= */

router.get(
  "/:id",
  getRoleController,
)


/* =========================================================
   UPDATE ROLE
   PUT /api/v1/roles/:id
========================================================= */

router.put(
  "/:id",
  updateRoleController,
)


/* =========================================================
   DELETE ROLE
   DELETE /api/v1/roles/:id
========================================================= */

router.delete(
  "/:id",
  deleteRoleController,
)


export default router