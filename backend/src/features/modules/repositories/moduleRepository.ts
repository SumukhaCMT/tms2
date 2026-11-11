import { searchCondition } from "../../../utils/search"
import type {
  ResultSetHeader,
  RowDataPacket,
  
} from "mysql2"

import pool from "../../../config/database"
import { generateCodes } from "../../../utils/generateCode";
import type {
  CreateModuleData,
    UpdateModuleData,
} from "../modulesTypes"
import { randomUUID } from "node:crypto";

export interface ModuleRow extends RowDataPacket {
  id: number
  module_code: string
  module_name: string
  module_type: string
  capacity_type: string | null
  consumable_type: string | null
  display_order: number
  status: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// ============================
// Get Modules
// ============================

export const getModulesList = async (): Promise<ModuleRow[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<ModuleRow[]>(`
      SELECT
        id,
        module_code,
        module_name,
        module_type,
        capacity_type,
        consumable_type,
        display_order,
        status,
        created_at,
        updated_at,
        deleted_at
      FROM modules
      WHERE deleted_at IS NULL
      ORDER BY display_order ASC
    `)

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
// ============================
// Get Modules pagination and rate limit
// ============================

export interface PaginatedModules {
  rows: ModuleRow[]
  total: number
}

export const getModules = async (
  limit: number,
  offset: number,
  search = "",
): Promise<PaginatedModules> => {
  let conn
  const filter = searchCondition(search, ["module_name", "module_code", "module_type", "capacity_type", "consumable_type", "display_order", "status"])
  const where = search ? `AND ${filter.sql}` : ""
  const params = search ? filter.params : []

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<ModuleRow[]>(
      `
        SELECT
          id,
          module_code,
          module_name,
          module_type,
          capacity_type,
          consumable_type,
          display_order,
          status,
          created_at,
          updated_at,
          deleted_at
        FROM modules
        WHERE deleted_at IS NULL ${where}
        ORDER BY display_order ASC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    )

    const [countRows] = await conn.execute<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
        FROM modules
        WHERE deleted_at IS NULL ${where}
      `,
      params,
    )

    const total = Number(countRows[0]?.total ?? 0)

    return {
      rows,
      total,
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
// ============================
// Get Module By ID
// ============================

export const getModuleById = async (
  id: number,
): Promise<ModuleRow | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<ModuleRow[]>(
      `
        SELECT
          id,
          module_code,
          module_name,
          module_type,
          capacity_type,
          consumable_type,
          display_order,
          status,
          created_at,
          updated_at,
          deleted_at
        FROM modules
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [id],
    )

    return rows[0] ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
// ============================
// Create Module
// ============================


export const insertModule = async (
 data: CreateModuleData,
 ):
  Promise<number> => {
     const conn = await pool.getConnection();
      try { await conn.beginTransaction();
         // Step 1: Generate a temporary unique code 
         const temporaryCode = `TMP-${randomUUID()}`; 
         // Step 2: Insert module
          const [result] = await conn.execute<ResultSetHeader>( ` 
            INSERT INTO 
            modules (
             module_code, module_name, module_type,
              capacity_type, consumable_type,
               display_order, status )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                 `,
                 [ temporaryCode,
                   data.module_name,
                    data.module_type,
                     data.capacity_type 
                     ?? null, 
                     data.consumable_type ?? null,
                      data.display_order ?? 1, data.status ??
                       "active", ], );
                        const moduleId = result.insertId;
                         if (!moduleId) 
                          { throw new Error( "Failed to create module: database ID was not returned.", ); }
                         
const moduleCode = generateCodes( data.module_name, );
 // Step 4: Save the final module code
 // 
 
 const [updateResult] = await conn.execute<ResultSetHeader>(
   ` UPDATE modules SET module_code = ? WHERE id = ? AND deleted_at IS NULL `, [moduleCode, moduleId], );
   if (updateResult.affectedRows !== 1) 
    { throw new Error("Failed to save the generated module code."); } 
   await conn.commit(); 
   return moduleId; } 
   catch (error) { 
    await conn.rollback();
     throw error; } 
     finally { conn.release(); } };

// ============================
// Update Module
// ============================

export const updateModule = async (
  id: number,
  data: UpdateModuleData,
): Promise<boolean> => {
  let conn

  try {
    conn = await pool.getConnection()

    const fields: string[] = []
    const values: (
  | string
  | number
  | null
  | boolean
  | Date
)[] = []

    if (data.module_code !== undefined) {
      fields.push("module_code = ?")
      values.push(data.module_code)
    }

    if (data.module_name !== undefined) {
      fields.push("module_name = ?")
      values.push(data.module_name)
    }

    if (data.module_type !== undefined) {
      fields.push("module_type = ?")
      values.push(data.module_type)
    }

    if (data.capacity_type !== undefined) {
      fields.push("capacity_type = ?")
      values.push(data.capacity_type)
    }

    if (data.consumable_type !== undefined) {
      fields.push("consumable_type = ?")
      values.push(data.consumable_type)
    }

    if (data.display_order !== undefined) {
      fields.push("display_order = ?")
      values.push(data.display_order)
    }

    if (data.status !== undefined) {
      fields.push("status = ?")
      values.push(data.status)
    }

    if (fields.length === 0) {
      return false
    }

    values.push(id)

    const [result] = await conn.execute<ResultSetHeader>(
      `
        UPDATE modules
        SET ${fields.join(", ")}
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      values,
    )

    return result.affectedRows > 0
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Soft Delete Module
// ============================

export const softDeleteModule = async (
  id: number,
): Promise<boolean> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [result] = await conn.execute<ResultSetHeader>(
      `
        UPDATE modules
        SET deleted_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      [id],
    )

    return result.affectedRows > 0
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Get Modules With Sub-Modules (for sidebar nav)
// ============================

export interface ModuleWithSubModuleRow extends RowDataPacket {
  module_id: number
  module_code: string
  module_name: string
  module_display_order: number
  sub_module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_display_order: number
}

export const getModulesWithSubModules = async (): Promise<
  ModuleWithSubModuleRow[]
> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<ModuleWithSubModuleRow[]>(`
      SELECT
        m.id AS module_id,
        m.module_code,
        m.module_name,
        m.display_order AS module_display_order,
        sm.id AS sub_module_id,
        sm.sub_module_code,
        sm.sub_module_name,
        sm.display_order AS sub_module_display_order
      FROM modules m
      JOIN sub_modules sm ON sm.module_id = m.id
      WHERE m.status = 'active'
        AND m.deleted_at IS NULL
        AND sm.sub_module_status = 'active'
      ORDER BY m.display_order ASC, m.id ASC, sm.display_order ASC, sm.id ASC
    `)

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
