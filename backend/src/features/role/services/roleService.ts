import db from "../../../config/database"

import {
  findRoleByCode,
  findRoleById,
  findRoleByName,
  findRoles,
  insertRole,
  insertRolePermissions,
  deleteRolePermissions,
  updateRole,
  deleteRole,
} from "../repositories/roleRepository"

import {
  validateCreateRole,
  validateUpdateRole,
} from "../validations/roleValidation"

import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleDetails,
  Role,
} from "../roleTypes"


/* =========================================================
   CREATE ROLE
========================================================= */

// export const createRole = async (
//   data: CreateRoleInput,
// ): Promise<RoleDetails> => {

//   const connection =
//     await db.getConnection()

//   try {

//     await connection.beginTransaction()


//     /* =====================================================
//        VALIDATE
//     ===================================================== */

//     const validationError =
//       validateCreateRole(data)

//     if (validationError) {
//       throw new Error(
//         validationError,
//       )
//     }


//     /* =====================================================
//        NORMALIZE
//     ===================================================== */

//     const userRole =
//       data.user_role
//         .trim()
//         .toLowerCase()

//     const userRoleName =
//       data.user_role_name
//         .trim()


//     /* =====================================================
//        CHECK CODE
//     ===================================================== */

//     const existingCode =
//       await findRoleByCode(
//         connection,
//         userRole,
//       )

//     if (existingCode) {
//       throw new Error(
//         "Role code already exists",
//       )
//     }


//     /* =====================================================
//        CHECK NAME
//     ===================================================== */

//     const existingName =
//       await findRoleByName(
//         connection,
//         userRoleName,
//       )

//     if (existingName) {
//       throw new Error(
//         "Role name already exists",
//       )
//     }


//     /* =====================================================
//        CREATE ROLE
//     ===================================================== */

//     const roleId =
//       await insertRole(
//         connection,
//         {
//           ...data,
//           user_role:
//             userRole,
//           user_role_name:
//             userRoleName,
//         },
//       )


//     /* =====================================================
//        CREATE PERMISSIONS
//     ===================================================== */

//     await insertRolePermissions(
//       connection,
//       roleId,
//       data.permissions,
//     )


//     /* =====================================================
//        GET CREATED ROLE
//     ===================================================== */

//     const role =
//       await findRoleById(
//         connection,
//         roleId,
//       )

//     if (!role) {
//       throw new Error(
//         "Role created but could not be retrieved",
//       )
//     }


//     await connection.commit()

//     return role

//   } catch (error) {

//     await connection.rollback()

//     throw error

//   } finally {

//     connection.release()

//   }
// }
export const createRole = async (
  data: CreateRoleInput,
): Promise<RoleDetails> => {

  const connection =
    await db.getConnection()

  try {

    await connection.beginTransaction()


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validationError =
      validateCreateRole(data)

    if (validationError) {
      throw new Error(validationError)
    }


    /* =====================================================
       ROLE CODE
    ===================================================== */

    const userRole =
      data.user_role_name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")


    if (!userRole) {
      throw new Error(
        "Unable to generate role code",
      )
    }


    /* =====================================================
       CHECK ROLE CODE
    ===================================================== */

    const existingCode =
      await findRoleByCode(
        connection,
        userRole,
      )

    if (existingCode) {
      throw new Error(
        "Role already exists",
      )
    }


    /* =====================================================
       CHECK ROLE NAME
    ===================================================== */

    const roleName =
      data.user_role_name.trim()

    const existingName =
      await findRoleByName(
        connection,
        roleName,
      )

    if (existingName) {
      throw new Error(
        "Role name already exists",
      )
    }


    /* =====================================================
       INSERT ROLE
    ===================================================== */

    const roleId =
      await insertRole(
        connection,
        {
          user_role_name: roleName,
          permissions: data.permissions,
        },
      )


    /* =====================================================
       INSERT PERMISSIONS
    ===================================================== */

    await insertRolePermissions(
      connection,
      roleId,
      data.permissions,
    )


    /* =====================================================
       GET CREATED ROLE
    ===================================================== */

    const role =
      await findRoleById(
        connection,
        roleId,
      )

    if (!role) {
      throw new Error(
        "Failed to create role",
      )
    }


    await connection.commit()

    return role

  } catch (error) {

    await connection.rollback()

    throw error

  } finally {

    connection.release()
  }
}

/* =========================================================
   GET ROLE
========================================================= */

export const getRoleById = async (
  id: number,
): Promise<RoleDetails> => {

  const connection =
    await db.getConnection()

  try {

    const role =
      await findRoleById(
        connection,
        id,
      )

    if (!role) {
      throw new Error(
        "Role not found",
      )
    }

    return role

  } finally {

    connection.release()

  }
}


/* =========================================================
   GET ROLES
========================================================= */

export const getRoles = async (): Promise<Role[]> => {

  const connection =
    await db.getConnection()

  try {

    return await findRoles(
      connection,
    )

  } finally {

    connection.release()

  }
}


/* =========================================================
   UPDATE ROLE
========================================================= */

export const editRole = async (
  id: number,
  data: UpdateRoleInput,
): Promise<RoleDetails> => {

  const connection =
    await db.getConnection()

  try {

    await connection.beginTransaction()


    /* =====================================================
       VALIDATE
    ===================================================== */

    const validationError =
      validateUpdateRole(data)

    if (validationError) {
      throw new Error(
        validationError,
      )
    }


    /* =====================================================
       CHECK ROLE
    ===================================================== */

    const existingRole =
      await findRoleById(
        connection,
        id,
      )

    if (!existingRole) {
      throw new Error(
        "Role not found",
      )
    }


    /* =====================================================
       CHECK CODE
    ===================================================== */

    if (
      data.user_role !== undefined
    ) {

      const userRole =
        data.user_role
          .trim()
          .toLowerCase()

      const roleWithCode =
        await findRoleByCode(
          connection,
          userRole,
        )

      if (
        roleWithCode &&
        roleWithCode.id !== id
      ) {
        throw new Error(
          "Role code already exists",
        )
      }

      data.user_role =
        userRole
    }


    /* =====================================================
       CHECK NAME
    ===================================================== */

    if (
      data.user_role_name !== undefined
    ) {

      const userRoleName =
        data.user_role_name.trim()

      const roleWithName =
        await findRoleByName(
          connection,
          userRoleName,
        )

      if (
        roleWithName &&
        roleWithName.id !== id
      ) {
        throw new Error(
          "Role name already exists",
        )
      }

      data.user_role_name =
        userRoleName
    }


    /* =====================================================
       UPDATE ROLE
    ===================================================== */

    await updateRole(
      connection,
      id,
      data,
    )


    /* =====================================================
       UPDATE PERMISSIONS
    ===================================================== */

    if (
      data.permissions !== undefined
    ) {

      await deleteRolePermissions(
        connection,
        id,
      )

      await insertRolePermissions(
        connection,
        id,
        data.permissions,
      )
    }


    /* =====================================================
       GET UPDATED ROLE
    ===================================================== */

    const updatedRole =
      await findRoleById(
        connection,
        id,
      )

    if (!updatedRole) {
      throw new Error(
        "Role could not be retrieved after update",
      )
    }


    await connection.commit()

    return updatedRole

  } catch (error) {

    await connection.rollback()

    throw error

  } finally {

    connection.release()

  }
}


/* =========================================================
   DELETE ROLE
========================================================= */

export const removeRole = async (
  id: number,
): Promise<void> => {

  const connection =
    await db.getConnection()

  try {

    await connection.beginTransaction()


    const role =
      await findRoleById(
        connection,
        id,
      )

    if (!role) {
      throw new Error(
        "Role not found",
      )
    }


    await deleteRole(
      connection,
      id,
    )


    await connection.commit()

  } catch (error) {

    await connection.rollback()

    throw error

  } finally {

    connection.release()

  }
}