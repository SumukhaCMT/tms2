import { searchCondition } from "../../../utils/search"
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import  pool  from "../../../config/database"
import { generateCodes } from "../../../utils/generateCode";
import type {
  CreateSubModuleRequest,
  SubModule,
 
} from "../subModuleTypes"
import { randomUUID } from "node:crypto";

interface SubModuleRow extends RowDataPacket, SubModule {}




export const createSubModule = async (
  connection: PoolConnection,
  data: CreateSubModuleRequest,
): Promise<number> => {
  // Step 1: Generate a temporary unique code
  const temporaryCode = `TMP-${randomUUID()}`;

  // Step 2: Insert the submodule
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
      temporaryCode,
      data.sub_module_name,
      data.sub_module_status ?? "active",
      data.display_order ?? 1,
      data.note ?? null,
    ],
  );

  const subModuleId = result.insertId;

  if (!subModuleId) {
    throw new Error(
      "Failed to create submodule: database ID was not returned.",
    );
  }

  // Step 3: Generate the final submodule code
  const subModuleCode = generateCodes(data.sub_module_name);

  // Step 4: Save the final code
  const [updateResult] = await connection.execute<ResultSetHeader>(
    `
      UPDATE sub_modules
      SET sub_module_code = ?
      WHERE id = ?
    `,
    [subModuleCode, subModuleId],
  );

  if (updateResult.affectedRows !== 1) {
    throw new Error("Failed to save the generated submodule code.");
  }

  // Step 5: Return the new submodule ID
  return subModuleId;
};



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
  search = "",
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

  const conditions: string[] = []
  const params: (number | string)[] = []

  if (moduleId !== undefined) {
    conditions.push("module_id = ?")
    params.push(moduleId)
  }

  if (search) {
    const filter = searchCondition(search, ["sub_module_name", "sub_module_code", "module_id", "sub_module_status", "note"])
    conditions.push(filter.sql)
    params.push(...filter.params)
  }

  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`

  sql += ` ORDER BY display_order ASC, id DESC`

  const [rows] = await pool.execute<SubModuleRow[]>(sql, params)

  return rows
}




export const updateSubModule = async (
  connection: PoolConnection,
  id: number,
  data: CreateSubModuleRequest,
): Promise<void> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE sub_modules
      SET
        module_id = ?,
        sub_module_name = ?,
        sub_module_status = ?,
        display_order = ?,
        note = ?
      WHERE id = ?
    `,
    [
      data.module_id,
      data.sub_module_name,
      data.sub_module_status ?? "active",
      data.display_order ?? 1,
      data.note ?? null,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    throw new Error(`Submodule with ID ${id} was not found or was not updated.`);
  }
};

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