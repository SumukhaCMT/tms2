import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

import type {
  CreateRoleInput,
  UpdateRoleInput,
  Role,
  RoleDetails,
} from "../roleTypes"


/* =========================================================
   GENERATE ROLE CODE
========================================================= */

const generateRoleCode = (
  roleName: string,
): string => {

  return roleName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}


/* =========================================================
   FIND ROLE BY ID
========================================================= */

export const findRoleById = async (
  connection: PoolConnection,
  id: number,
): Promise<RoleDetails | null> => {

  const [
    roleRows,
  ] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        id,
        user_role,
        user_role_name,
        created_at,
        updated_at
      FROM default_roles
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  )

  if (
    roleRows.length === 0
  ) {
    return null
  }

  const [
    permissionRows,
  ] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        id,
        sub_module_id,
        permission
      FROM default_permissions
      WHERE role_id = ?
      ORDER BY sub_module_id ASC
    `,
    [id],
  )

  return {
    ...(roleRows[0] as Role),

    permissions:
      permissionRows as Array<{
        id: number
        sub_module_id: number
        permission: number
      }>,
  }
}


/* =========================================================
   FIND ROLE BY CODE
========================================================= */

export const findRoleByCode = async (
  connection: PoolConnection,
  userRole: string,
): Promise<Role | null> => {

  const [
    rows,
  ] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        id,
        user_role,
        user_role_name,
        created_at,
        updated_at
      FROM default_roles
      WHERE user_role = ?
      LIMIT 1
    `,
    [userRole],
  )

  if (
    rows.length === 0
  ) {
    return null
  }

  return rows[0] as Role
}


/* =========================================================
   FIND ROLE BY NAME
========================================================= */

export const findRoleByName = async (
  connection: PoolConnection,
  userRoleName: string,
): Promise<Role | null> => {

  const [
    rows,
  ] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        id,
        user_role,
        user_role_name,
        created_at,
        updated_at
      FROM default_roles
      WHERE user_role_name = ?
      LIMIT 1
    `,
    [userRoleName],
  )

  if (
    rows.length === 0
  ) {
    return null
  }

  return rows[0] as Role
}


/* =========================================================
   CREATE ROLE
========================================================= */

export const insertRole = async (
  connection: PoolConnection,
  data: CreateRoleInput,
): Promise<number> => {

  const userRole = data.user_role_name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  const [
    result,
  ] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO default_roles (
        user_role,
        user_role_name
      )
      VALUES (?, ?)
    `,
    [
      userRole,
      data.user_role_name.trim(),
    ],
  )

  return result.insertId
}


/* =========================================================
   INSERT ROLE PERMISSIONS
========================================================= */

export const insertRolePermissions = async (
  connection: PoolConnection,
  roleId: number,
  permissions: CreateRoleInput["permissions"],
): Promise<void> => {

  for (
    const item of permissions
  ) {

    await connection.execute(
      `
        INSERT INTO default_permissions (
          role_id,
          sub_module_id,
          permission
        )
        VALUES (?, ?, ?)
      `,
      [
        roleId,
        item.sub_module_id,
        item.permission,
      ],
    )
  }
}


/* =========================================================
   DELETE ROLE PERMISSIONS
========================================================= */

export const deleteRolePermissions = async (
  connection: PoolConnection,
  roleId: number,
): Promise<void> => {

  await connection.execute(
    `
      DELETE FROM default_permissions
      WHERE role_id = ?
    `,
    [roleId],
  )
}


/* =========================================================
   UPDATE ROLE
========================================================= */

export const updateRole = async (
  connection: PoolConnection,
  id: number,
  data: UpdateRoleInput,
): Promise<void> => {

  const fields: string[] = []
  // const values: unknown[] = []
const values: Array<string | number> = []

  /* =====================================================
     ROLE NAME
  ===================================================== */

  if (
    data.user_role_name !== undefined
  ) {

    const roleName =
      data.user_role_name.trim()

    /*
      Generate:

      Temple Manager
      ↓
      temple_manager
    */

    const userRole =
      generateRoleCode(
        roleName,
      )

    fields.push(
      "user_role = ?",
    )

    values.push(
      userRole,
    )

    fields.push(
      "user_role_name = ?",
    )

    values.push(
      roleName,
    )
  }


  /* =====================================================
     ROLE CODE

     This is kept only for backward compatibility.
     Normally frontend should NOT send user_role.
  ===================================================== */

  if (
    data.user_role !== undefined &&
    data.user_role_name === undefined
  ) {

    fields.push(
      "user_role = ?",
    )

    values.push(
      data.user_role,
    )
  }


  /* =====================================================
     NOTHING TO UPDATE
  ===================================================== */

  if (
    fields.length === 0
  ) {
    return
  }


  values.push(id)


  await connection.execute(
    `
      UPDATE default_roles
      SET
        ${fields.join(", ")}
      WHERE id = ?
    `,
    values,
  )
}



// export const updateRole = async (
//   connection: PoolConnection,
//   id: number,
//   data: UpdateRoleInput,
// ): Promise<void> => {

//   const fields: string[] = []

//   const values: Array<string | number> = []


//   /* =====================================================
//      USER ROLE
//   ===================================================== */

//   if (
//     data.user_role !== undefined
//   ) {

//     fields.push(
//       "user_role = ?",
//     )

//     values.push(
//       data.user_role.trim(),
//     )
//   }


//   /* =====================================================
//      USER ROLE NAME
//   ===================================================== */

//   if (
//     data.user_role_name !== undefined
//   ) {

//     fields.push(
//       "user_role_name = ?",
//     )

//     values.push(
//       data.user_role_name.trim(),
//     )
//   }


//   /* =====================================================
//      NOTHING TO UPDATE
//   ===================================================== */

//   if (
//     fields.length === 0
//   ) {
//     return
//   }


//   /* =====================================================
//      ROLE ID
//   ===================================================== */

//   values.push(
//     id,
//   )


//   /* =====================================================
//      UPDATE ROLE
//   ===================================================== */

//   await connection.execute(
//     `
//       UPDATE default_roles
//       SET
//         ${fields.join(", ")}
//       WHERE id = ?
//     `,
//     values,
//   )
// }

/* =========================================================
   DELETE ROLE
========================================================= */

export const deleteRole = async (
  connection: PoolConnection,
  id: number,
): Promise<void> => {

  /*
    Delete permissions first because
    default_permissions references default_roles.
  */

  await connection.execute(
    `
      DELETE FROM default_permissions
      WHERE role_id = ?
    `,
    [id],
  )


  await connection.execute(
    `
      DELETE FROM default_roles
      WHERE id = ?
    `,
    [id],
  )
}


/* =========================================================
   LIST ROLES
========================================================= */

export const findRoles = async (
  connection: PoolConnection,
): Promise<Role[]> => {

  const [
    rows,
  ] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        id,
        user_role,
        user_role_name,
        created_at,
        updated_at
      FROM default_roles
      ORDER BY id DESC
    `,
  )

  return rows as Role[]
}