import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"

import type {
  CreateDefineHundiData,
  UpdateDefineHundiData,
  DefineHundi,
  DefineHundiListItem,
  HundiListScope,
} from "../hundiTypes"

export const insertDefineHundi = async (data: CreateDefineHundiData): Promise<number> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [result] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO define_hundi (organization_id, temple_id, deity_id, hundi_number, hundi_name, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [data.organization_id, data.temple_id, data.deity_id, data.hundi_number, data.hundi_name, data.created_by],
    )

    return result.insertId
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getDefineHundisForScope = async (
  scope: HundiListScope,
): Promise<DefineHundiListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["dh.deleted_at IS NULL"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("dh.organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("dh.temple_id = ?")
      params.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & DefineHundiListItem)[]>(
      `
        SELECT
          dh.id,
          dh.temple_id,
          t.temp_name,
          dh.deity_id,
          d.name AS deity_name,
          dh.hundi_number,
          dh.hundi_name,
          dh.status,
          dh.created_at
        FROM define_hundi dh
        JOIN temples t ON t.id = dh.temple_id
        JOIN deities d ON d.id = dh.deity_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY dh.created_at DESC
      `,
      params,
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getDefineHundiById = async (id: number): Promise<DefineHundi | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & DefineHundi)[]>(
      `SELECT * FROM define_hundi WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [id],
    )

    return rows[0] ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const updateDefineHundi = async (id: number, data: UpdateDefineHundiData): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `
        UPDATE define_hundi
        SET deity_id = ?, hundi_number = ?, hundi_name = ?, status = ?, updated_by = ?
        WHERE id = ?
      `,
      [data.deity_id, data.hundi_number, data.hundi_name, data.status, data.updated_by, id],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const deleteDefineHundi = async (id: number): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `UPDATE define_hundi SET deleted_at = NOW() WHERE id = ?`,
      [id],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
