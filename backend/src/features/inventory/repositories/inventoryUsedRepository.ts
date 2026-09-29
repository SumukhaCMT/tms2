import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"

import type {
  InventoryListScope,
  InventoryItemOption,
  InventoryStockSummary,
  InventoryUsedListItem,
  InventoryUsedDetail,
  InventoryUsageHistoryItem,
  CreateInventoryUsedData,
  UpdateInventoryUsedData,
} from "../inventoryTypes"

export const getInventoryItemOptionsForScope = async (scope: InventoryListScope): Promise<InventoryItemOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["inventory_deleted_at IS NULL"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("inventory_organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("inventory_temple_id = ?")
      params.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & InventoryItemOption)[]>(
      `
        SELECT id, inventory_item_name, inventory_item_type
        FROM inventory
        WHERE ${conditions.join(" AND ")}
        ORDER BY inventory_item_name ASC
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

export const getInventoryStockSummaryById = async (
  itemId: number,
  excludeUsedId: number,
): Promise<InventoryStockSummary | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & {
      id: number
      inventory_organization_id: number
      inventory_temple_id: number
      inventory_item_name: string
      inventory_item_type: InventoryStockSummary["inventory_item_type"]
      total_stock: number
      total_used: number
      unit_name: string | null
      measurement: number | null
      measurement_id: number | null
      unit_factor: number
      total_used_base: number
    })[]>(
      `
        SELECT
          i.id,
          i.inventory_organization_id,
          i.inventory_temple_id,
          i.inventory_item_name,
          i.inventory_item_type,
          i.inventory_stock_quantity AS total_stock,
          COALESCE((
            SELECT SUM(iu.inventory_used_quantity)
            FROM inventory_used iu
            WHERE iu.inventory_item_id = i.id AND iu.id != ?
          ), 0) AS total_used,
          du.unit_name,
          i.inventory_measurement AS measurement,
          du.measurement_id,
          COALESCE(du.conversion_factor, 1) AS unit_factor,
          COALESCE((
            SELECT SUM(iu.inventory_used_quantity * COALESCE(iu.inventory_used_measurement, 1) * COALESCE(uu.conversion_factor, du.conversion_factor, 1))
            FROM inventory_used iu
            LEFT JOIN inventory_measurement_units uu ON uu.id = iu.inventory_used_unit
            WHERE iu.inventory_item_id = i.id AND iu.id != ?
          ), 0) AS total_used_base
        FROM inventory i
        LEFT JOIN inventory_measurement_units du ON du.id = i.inventory_unit
        WHERE i.id = ? AND i.inventory_deleted_at IS NULL
        LIMIT 1
      `,
      [excludeUsedId, excludeUsedId, itemId],
    )

    const row = rows[0]
    if (!row) return null

    const totalStock = Number(row.total_stock) || 0
    const totalUsed = Number(row.total_used) || 0
    const totalStockBase = totalStock * (Number(row.measurement) || 1) * (Number(row.unit_factor) || 1)
    const totalUsedBase = Number(row.total_used_base) || 0

    return {
      id: row.id,
      inventory_organization_id: row.inventory_organization_id,
      inventory_temple_id: row.inventory_temple_id,
      inventory_item_name: row.inventory_item_name,
      inventory_item_type: row.inventory_item_type,
      total_stock: totalStock,
      total_used: totalUsed,
      total_remaining: totalStock - totalUsed,
      unit_name: row.unit_name ?? "",
      measurement: row.measurement === null ? null : Number(row.measurement),
      measurement_id: row.measurement_id,
      total_stock_base: totalStockBase,
      total_used_base: totalUsedBase,
      total_remaining_base: totalStockBase - totalUsedBase,
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const isUsedTransactionNumberTaken = async (transactionNumber: string): Promise<boolean> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM inventory_used WHERE inventory_transaction_number = ? LIMIT 1`,
      [transactionNumber],
    )

    return rows.length > 0
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const insertInventoryUsed = async (
  data: CreateInventoryUsedData,
  transactionNumber: string,
): Promise<number> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [result] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO inventory_used (
          inventory_transaction_number,
          inventory_organization_id,
          inventory_temple_id,
          inventory_item_id,
          inventory_user_id,
          inventory_used_quantity,
          inventory_used_unit,
          inventory_used_measurement,
          inventory_used_date,
          inventory_used_where,
          inventory_general_remarks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        transactionNumber,
        data.organization_id,
        data.temple_id,
        data.item_id,
        data.created_by,
        data.used_quantity,
        data.used_unit,
        data.used_measurement,
        data.used_date,
        data.used_where,
        data.remarks,
      ],
    )

    return result.insertId
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getInventoryUsedForScope = async (scope: InventoryListScope): Promise<InventoryUsedListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("iu.inventory_organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("iu.inventory_temple_id = ?")
      params.push(scope.temple_id)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

    const [rows] = await conn.execute<(RowDataPacket & {
      id: number
      transaction_number: string
      item_id: number
      item_name: string
      item_type: InventoryUsedListItem["item_type"]
      total_stock: number
      total_used: number
      used_date: Date
      used_by_name: string
    })[]>(
      `
        SELECT
          iu.id,
          iu.inventory_transaction_number AS transaction_number,
          iu.inventory_item_id AS item_id,
          i.inventory_item_name AS item_name,
          i.inventory_item_type AS item_type,
          i.inventory_stock_quantity AS total_stock,
          COALESCE((
            SELECT SUM(iu2.inventory_used_quantity)
            FROM inventory_used iu2
            WHERE iu2.inventory_item_id = i.id
          ), 0) AS total_used,
          iu.inventory_used_date AS used_date,
          u.user_name AS used_by_name
        FROM inventory_used iu
        JOIN inventory i ON i.id = iu.inventory_item_id
        JOIN users u ON u.id = iu.inventory_user_id
        ${whereClause}
        ORDER BY iu.inventory_used_date DESC, iu.id DESC
      `,
      params,
    )

    return rows.map((row) => {
      const totalStock = Number(row.total_stock) || 0
      const totalUsed = Number(row.total_used) || 0
      return {
        id: row.id,
        transaction_number: row.transaction_number,
        item_id: row.item_id,
        item_name: row.item_name,
        item_type: row.item_type,
        total_stock: totalStock,
        total_used: totalUsed,
        total_remaining: totalStock - totalUsed,
        used_date: row.used_date,
        used_by_name: row.used_by_name,
      }
    })
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getInventoryUsedDetailById = async (id: number): Promise<InventoryUsedDetail | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & {
      id: number
      inventory_organization_id: number
      inventory_temple_id: number
      transaction_number: string
      item_id: number
      item_name: string
      item_type: InventoryUsedDetail["item_type"]
      used_quantity: number
      used_unit: number
      unit_name: string | null
      used_measurement: number | null
      used_where: string
      used_date: Date
      remarks: string | null
      used_by_name: string
      total_stock: number
      total_used: number
      stock_unit_name: string | null
      stock_measurement: number | null
    })[]>(
      `
        SELECT
          iu.id,
          iu.inventory_organization_id,
          iu.inventory_temple_id,
          iu.inventory_transaction_number AS transaction_number,
          iu.inventory_item_id AS item_id,
          i.inventory_item_name AS item_name,
          i.inventory_item_type AS item_type,
          iu.inventory_used_quantity AS used_quantity,
          iu.inventory_used_unit AS used_unit,
          du.unit_name,
          iu.inventory_used_measurement AS used_measurement,
          iu.inventory_used_where AS used_where,
          iu.inventory_used_date AS used_date,
          iu.inventory_general_remarks AS remarks,
          u.user_name AS used_by_name,
          i.inventory_stock_quantity AS total_stock,
          COALESCE((
            SELECT SUM(iu2.inventory_used_quantity)
            FROM inventory_used iu2
            WHERE iu2.inventory_item_id = i.id
          ), 0) AS total_used,
          sdu.unit_name AS stock_unit_name,
          i.inventory_measurement AS stock_measurement
        FROM inventory_used iu
        JOIN inventory i ON i.id = iu.inventory_item_id
        JOIN users u ON u.id = iu.inventory_user_id
        LEFT JOIN inventory_measurement_units du ON du.id = iu.inventory_used_unit
        LEFT JOIN inventory_measurement_units sdu ON sdu.id = i.inventory_unit
        WHERE iu.id = ?
        LIMIT 1
      `,
      [id],
    )

    const row = rows[0]
    if (!row) return null

    const totalStock = Number(row.total_stock) || 0
    const totalUsed = Number(row.total_used) || 0

    return {
      id: row.id,
      inventory_organization_id: row.inventory_organization_id,
      inventory_temple_id: row.inventory_temple_id,
      transaction_number: row.transaction_number,
      item_id: row.item_id,
      item_name: row.item_name,
      item_type: row.item_type,
      used_quantity: Number(row.used_quantity) || 0,
      used_unit: row.used_unit,
      unit_name: row.unit_name ?? "",
      used_measurement: row.used_measurement,
      used_where: row.used_where,
      used_date: row.used_date,
      remarks: row.remarks,
      used_by_name: row.used_by_name,
      total_stock: totalStock,
      total_used: totalUsed,
      total_remaining: totalStock - totalUsed,
      stock_unit_name: row.stock_unit_name ?? "",
      stock_measurement: row.stock_measurement === null ? null : Number(row.stock_measurement),
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const updateInventoryUsedRecord = async (id: number, data: UpdateInventoryUsedData): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `
        UPDATE inventory_used
        SET
          inventory_item_id = ?,
          inventory_used_quantity = ?,
          inventory_used_unit = ?,
          inventory_used_measurement = ?,
          inventory_used_where = ?,
          inventory_used_date = ?,
          inventory_general_remarks = ?
        WHERE id = ?
      `,
      [
        data.item_id,
        data.used_quantity,
        data.used_unit,
        data.used_measurement,
        data.used_where,
        data.used_date,
        data.remarks,
        id,
      ],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const deleteInventoryUsedRecord = async (id: number): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(`DELETE FROM inventory_used WHERE id = ?`, [id])
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getInventoryUsageHistoryByItemId = async (itemId: number): Promise<InventoryUsageHistoryItem[]> => {
  const [rows] = await pool.execute<(RowDataPacket & InventoryUsageHistoryItem)[]>(
    `
      SELECT
        iu.id,
        iu.inventory_transaction_number AS transaction_number,
        iu.inventory_used_quantity AS used_quantity,
        du.unit_name,
        iu.inventory_used_measurement AS used_measurement,
        iu.inventory_used_where AS used_where,
        iu.inventory_used_date AS used_date,
        iu.inventory_general_remarks AS remarks,
        u.user_name AS used_by_name
      FROM inventory_used iu
      JOIN users u ON u.id = iu.inventory_user_id
      LEFT JOIN inventory_measurement_units du ON du.id = iu.inventory_used_unit
      WHERE iu.inventory_item_id = ?
      ORDER BY iu.inventory_used_date DESC, iu.id DESC
    `,
    [itemId],
  )

  return rows
}
