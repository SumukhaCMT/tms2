import type {
  Request,
  Response,
} from "express"

import {
  createRole,
  editRole,
  getRoleById,
  getRoles,
  removeRole,
} from "../services/roleService"


/* =========================================================
   CREATE ROLE
========================================================= */

// export const createRoleController = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {

//   try {

//     const role =
//       await createRole(
//         req.body,
//       )

//     res.status(201).json({
//       success: true,
//       message:
//         "Role created successfully",
//       data: role,
//     })

//   } catch (error) {

//     const message =
//       error instanceof Error
//         ? error.message
//         : "Failed to create role"

//     res.status(400).json({
//       success: false,
//       message,
//     })
//   }
// }

export const createRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const {
      user_role_name,
      permissions,
    } = req.body


    const role = await createRole({
      user_role_name,
      permissions,
    })


    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    })

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create role"

    res.status(400).json({
      success: false,
      message,
    })
  }
}

/* =========================================================
   GET ROLES
========================================================= */

export const getRolesController = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const roles =
      await getRoles()

    res.status(200).json({
      success: true,
      message:
        "Roles fetched successfully",
      data: roles,
    })

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch roles"

    res.status(500).json({
      success: false,
      message,
    })
  }
}


/* =========================================================
   GET ROLE BY ID
========================================================= */

export const getRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const id =
      Number(req.params.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid role ID",
      })

      return
    }

    const role =
      await getRoleById(id)

    res.status(200).json({
      success: true,
      message:
        "Role fetched successfully",
      data: role,
    })

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Role not found"

    res.status(404).json({
      success: false,
      message,
    })
  }
}


/* =========================================================
   UPDATE ROLE
========================================================= */

export const updateRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const id =
      Number(req.params.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid role ID",
      })

      return
    }

    const role =
      await editRole(
        id,
        req.body,
      )

    res.status(200).json({
      success: true,
      message:
        "Role updated successfully",
      data: role,
    })

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update role"

    res.status(400).json({
      success: false,
      message,
    })
  }
}


/* =========================================================
   DELETE ROLE
========================================================= */

export const deleteRoleController = async (
  req: Request,
  res: Response,
): Promise<void> => {

  try {

    const id =
      Number(req.params.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid role ID",
      })

      return
    }

    await removeRole(id)

    res.status(200).json({
      success: true,
      message:
        "Role deleted successfully",
    })

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete role"

    res.status(400).json({
      success: false,
      message,
    })
  }
}