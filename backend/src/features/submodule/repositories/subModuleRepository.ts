import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import  pool  from "../../../config/database"
import type {
  CreateSubModuleRequest,
  SubModule,
 
} from "../subModuleTypes"

interface SubModuleRow extends RowDataPacket, SubModule {}

export const createSubModule = async (
  connection: PoolConnection,
  data: CreateSubModuleRequest,
): Promise<number> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO sub_modules (
        module_id,
        sub_module_code,
        sub_module_name,
        sub_module_status,
        display_order,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.module_id,
      data.sub_module_code,
      data.sub_module_name,
      data.sub_module_status,
      data.display_order,
      data.note ?? null,
    ],
  )

  return result.insertId
}

export const findSubModuleById = async (
  id: number,
): Promise<SubModule | null> => {
  const [rows] = await pool.execute<SubModuleRow[]>(
    `
      SELECT
        id,
        module_id,
        sub_module_code,
        sub_module_name,
        sub_module_status,
        display_order,
        note,
        created_at,
        updated_at
      FROM sub_modules
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  )

  return rows[0] ?? null
}

export const findSubModules = async (
  moduleId?: number,
): Promise<SubModule[]> => {
  let sql = `
    SELECT
      id,
      module_id,
      sub_module_code,
      sub_module_name,
      sub_module_status,
      display_order,
      note,
      created_at,
      updated_at
    FROM sub_modules
  `

  const params: number[] = []

  if (moduleId !== undefined) {
    sql += ` WHERE module_id = ?`
    params.push(moduleId)
  }

  sql += ` ORDER BY display_order ASC, id DESC`

  const [rows] = await pool.execute<SubModuleRow[]>(sql, params)

  return rows
}

export const updateSubModule = async (
  connection: PoolConnection,
  id: number,
  data: CreateSubModuleRequest,
): Promise<void> => {
  await connection.execute(
    `
      UPDATE sub_modules
      SET
        module_id = ?,
        sub_module_code = ?,
        sub_module_name = ?,
        sub_module_status = ?,
        display_order = ?,
        note = ?
      WHERE id = ?
    `,
    [
      data.module_id,
      data.sub_module_code,
      data.sub_module_name,
      data.sub_module_status,
      data.display_order,
      data.note ?? null,
      id,
    ],
  )
}

export const deleteSubModule = async (
  connection: PoolConnection,
  id: number,
): Promise<void> => {
  await connection.execute(
    `
      DELETE FROM sub_modules
      WHERE id = ?
    `,
    [id],
  )
}

export const getConnection = (): Promise<PoolConnection> =>
  pool.getConnection()