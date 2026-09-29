import type { ResultSetHeader, RowDataPacket } from "mysql2"
import type { PoolConnection } from "mysql2/promise"

import pool from "../../../config/database"
import { getTempleName, getTemplesForOrganization, templeBelongsToOrganization } from "../../donations/repositories/donationRepository"

import type {
  CreateInventoryData,
  CreateInventoryResultRow,
  InventoryBatchData,
  InventoryBatchItemData,
  InventoryGroup,
  InventoryGroupItem,
  InventoryListItem,
  InventoryListScope,
  InventoryDetail,
  InventoryItemType,
  GivenBySuggestion,
  InventoryItemSuggestion,
} from "../inventoryTypes"

export { getTempleName, getTemplesForOrganization, templeBelongsToOrganization }

export function slugifyItemCode(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

export const getInventoryItemTypeOptions = async (): Promise<InventoryItemType[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & { COLUMN_TYPE: string })[]>(
      `
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'inventory'
          AND COLUMN_NAME = 'inventory_item_type'
      `,
    )

    const columnType = rows[0]?.COLUMN_TYPE ?? ""
    const matches = [...columnType.matchAll(/'([^']+)'/g)]

    return matches.map((match) => match[1] as InventoryItemType)
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const searchGivenByValues = async (
  scope: InventoryListScope,
  query: string,
): Promise<GivenBySuggestion[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const donationConditions: string[] = ["donor_name LIKE ?"]
    const inventoryConditions: string[] = ["inventory_given_by LIKE ?", "inventory_given_by IS NOT NULL"]
    const donationParams: (string | number)[] = [`%${query}%`]
    const inventoryParams: (string | number)[] = [`%${query}%`]

    if (!scope.temple_id && scope.organization_id) {
      donationConditions.push("organization_id = ?")
      inventoryConditions.push("inventory_organization_id = ?")
      donationParams.push(scope.organization_id)
      inventoryParams.push(scope.organization_id)
    } else if (scope.temple_id) {
      donationConditions.push("temple_id = ?")
      inventoryConditions.push("inventory_temple_id = ?")
      donationParams.push(scope.temple_id)
      inventoryParams.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & { given_by: string })[]>(
      `
        SELECT donor_name AS given_by FROM donations WHERE ${donationConditions.join(" AND ")}
        UNION
        SELECT inventory_given_by AS given_by FROM inventory WHERE ${inventoryConditions.join(" AND ")}
        LIMIT 10
      `,
      [...donationParams, ...inventoryParams],
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const searchInventoryItems = async (
  scope: InventoryListScope,
  query: string,
): Promise<InventoryItemSuggestion[]> => {
  const conditions: string[] = ["inventory_deleted_at IS NULL", "inventory_item_name LIKE ?"]
  const params: (string | number)[] = [`%${query}%`]

  if (!scope.temple_id && scope.organization_id) {
    conditions.push("inventory_organization_id = ?")
    params.push(scope.organization_id)
  } else if (scope.temple_id) {
    conditions.push("inventory_temple_id = ?")
    params.push(scope.temple_id)
  }

  const [rows] = await pool.execute<(RowDataPacket & InventoryItemSuggestion)[]>(
    `
      SELECT
        i.inventory_item_name AS item_name,
        i.inventory_stock_quantity AS stock_quantity,
        i.inventory_unit AS unit_id,
        du.unit_name,
        i.inventory_measurement AS measurement
      FROM inventory i
      LEFT JOIN inventory_measurement_units du ON du.id = i.inventory_unit
      WHERE i.id IN (
        SELECT MAX(id)
        FROM inventory
        WHERE ${conditions.join(" AND ")}
        GROUP BY inventory_item_code
      )
      ORDER BY i.inventory_item_name ASC
      LIMIT 10
    `,
    params,
  )

  return rows
}

const runInTransaction = async <T>(work: (conn: PoolConnection) => Promise<T>): Promise<T> => {
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  return work(conn)
    .then(async (result) => {
      await conn.commit()
      return result
    }, async (error) => {
      await conn.rollback()
      throw error
    })
    .finally(() => conn.release())
}

const insertBatchItem = async (
  conn: PoolConnection,
  scope: { organization_id: number; temple_id: number; created_by: number },
  batch: InventoryBatchData,
  item: InventoryBatchItemData,
): Promise<CreateInventoryResultRow> => {
  const itemCode = slugifyItemCode(item.item_name)

  const [inventoryResult] = await conn.execute<ResultSetHeader>(
    `
      INSERT INTO inventory (
        inventory_organization_id,
        inventory_temple_id,
        inventory_user_id,
        inventory_item_name,
        inventory_item_code,
        inventory_item_type,
        inventory_unit,
        inventory_measurement,
        inventory_stock_quantity,
        inventory_given_by,
        inventory_stored_at,
        inventory_created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      scope.organization_id,
      scope.temple_id,
      scope.created_by,
      item.item_name,
      itemCode,
      batch.item_type,
      item.unit_id,
      item.measurement,
      item.stock_quantity,
      batch.given_by,
      batch.stored_at,
      batch.given_at,
    ],
  )

  await conn.execute<ResultSetHeader>(
    `
      INSERT INTO inventory_stocks (
        inventory_organization_id,
        inventory_temple_id,
        inventory_item_id,
        inventory_user_id,
        inventory_quantity,
        inventory_unit,
        inventory_measurement,
        inventory_stock_left,
        inventory_transaction_date,
        inventory_remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      scope.organization_id,
      scope.temple_id,
      inventoryResult.insertId,
      scope.created_by,
      item.stock_quantity,
      item.unit_id,
      item.measurement,
      item.stock_quantity,
      batch.given_at,
      batch.remarks,
    ],
  )

  return { id: inventoryResult.insertId, item_name: item.item_name, item_code: itemCode, item_type: batch.item_type }
}

export const insertInventoryBatch = async (data: CreateInventoryData): Promise<CreateInventoryResultRow[]> => {
  return runInTransaction(async (conn) => {
    const results: CreateInventoryResultRow[] = []
    for (const item of data.items) {
      results.push(await insertBatchItem(conn, data, data, item))
    }
    return results
  })
}

export const getInventoryForScope = async (scope: InventoryListScope): Promise<InventoryListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["i.inventory_deleted_at IS NULL"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("i.inventory_organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("i.inventory_temple_id = ?", "u.role_id <> 2")
      params.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & InventoryListItem)[]>(
      `
        SELECT
          i.id,
          i.inventory_item_name,
          i.inventory_item_type,
          i.inventory_stock_quantity,
          i.inventory_created_at,
          COALESCE((
            SELECT SUM(s.inventory_stock_left)
            FROM inventory_stocks s
            WHERE s.inventory_item_id = i.id
          ), 0) AS stock_left,
          t.temp_name,
          u.user_name AS created_by_name
        FROM inventory i
        JOIN temples t ON t.id = i.inventory_temple_id
        JOIN users u ON u.id = i.inventory_user_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY i.inventory_created_at DESC
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

export const getInventoryDetailById = async (id: number): Promise<InventoryDetail | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & InventoryDetail)[]>(
      `
        SELECT
          i.id,
          i.inventory_organization_id,
          i.inventory_temple_id,
          t.temp_name,
          i.inventory_item_name,
          i.inventory_item_code,
          i.inventory_item_type,
          i.inventory_unit,
          du.unit_name,
          i.inventory_measurement,
          i.inventory_stock_quantity,
          COALESCE((
            SELECT SUM(s.inventory_stock_left)
            FROM inventory_stocks s
            WHERE s.inventory_item_id = i.id
          ), 0) AS stock_left,
          i.inventory_given_by,
          i.inventory_stored_at,
          i.inventory_created_at,
          u.user_name AS created_by_name,
          u.role_id AS created_by_role_id,
          (
            SELECT s.inventory_remarks
            FROM inventory_stocks s
            WHERE s.inventory_item_id = i.id
            ORDER BY s.id DESC
            LIMIT 1
          ) AS remarks
        FROM inventory i
        JOIN temples t ON t.id = i.inventory_temple_id
        JOIN users u ON u.id = i.inventory_user_id
        LEFT JOIN inventory_measurement_units du ON du.id = i.inventory_unit
        WHERE i.id = ? AND i.inventory_deleted_at IS NULL
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

export const deleteInventory = async (id: number): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `UPDATE inventory SET inventory_deleted_at = NOW() WHERE id = ?`,
      [id],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getInventoryGroupById = async (id: number): Promise<InventoryGroup | null> => {
  const [heads] = await pool.execute<(RowDataPacket & Omit<InventoryGroup, "items">)[]>(
    `
      SELECT
        i.id,
        i.inventory_organization_id AS organization_id,
        i.inventory_temple_id AS temple_id,
        t.temp_name,
        i.inventory_given_by AS given_by,
        DATE_FORMAT(i.inventory_created_at, '%Y-%m-%dT%H:%i') AS given_at,
        i.inventory_item_type AS item_type,
        i.inventory_stored_at AS stored_at,
        (
          SELECT s.inventory_remarks
          FROM inventory_stocks s
          WHERE s.inventory_item_id = i.id
          ORDER BY s.id ASC
          LIMIT 1
        ) AS remarks,
        u.user_name AS created_by_name,
        u.role_id AS created_by_role_id
      FROM inventory i
      JOIN temples t ON t.id = i.inventory_temple_id
      JOIN users u ON u.id = i.inventory_user_id
      WHERE i.id = ? AND i.inventory_deleted_at IS NULL
      LIMIT 1
    `,
    [id],
  )

  const head = heads[0]
  if (!head) return null

  const [items] = await pool.execute<(RowDataPacket & InventoryGroupItem)[]>(
    `
      SELECT
        i.id,
        i.inventory_item_name AS item_name,
        i.inventory_item_code AS item_code,
        i.inventory_stock_quantity AS stock_quantity,
        i.inventory_unit AS unit_id,
        du.unit_name,
        i.inventory_measurement AS measurement
      FROM inventory i
      LEFT JOIN inventory_measurement_units du ON du.id = i.inventory_unit
      WHERE i.inventory_temple_id = ?
        AND i.inventory_given_by <=> ?
        AND DATE_FORMAT(i.inventory_created_at, '%Y-%m-%dT%H:%i') = ?
        AND i.inventory_item_type = ?
        AND i.inventory_deleted_at IS NULL
      ORDER BY i.id ASC
    `,
    [head.temple_id, head.given_by, head.given_at, head.item_type],
  )

  return { ...head, items }
}

export const updateInventoryGroup = async (group: InventoryGroup, userId: number, data: InventoryBatchData): Promise<number> => {
  const keptIds = new Set(data.items.filter((item) => item.id).map((item) => item.id))
  const removedIds = group.items.filter((item) => !keptIds.has(item.id)).map((item) => item.id)
  const scope = { organization_id: group.organization_id, temple_id: group.temple_id, created_by: userId }

  return runInTransaction(async (conn) => {
    let firstId = 0

    for (const item of data.items) {
      if (!item.id) {
        const created = await insertBatchItem(conn, scope, data, item)
        firstId = firstId || created.id
        continue
      }

      firstId = firstId || item.id

      await conn.execute<ResultSetHeader>(
        `
          UPDATE inventory
          SET
            inventory_item_name = ?,
            inventory_item_code = ?,
            inventory_item_type = ?,
            inventory_unit = ?,
            inventory_measurement = ?,
            inventory_stock_quantity = ?,
            inventory_given_by = ?,
            inventory_stored_at = ?,
            inventory_created_at = ?
          WHERE id = ?
        `,
        [
          item.item_name,
          slugifyItemCode(item.item_name),
          data.item_type,
          item.unit_id,
          item.measurement,
          item.stock_quantity,
          data.given_by,
          data.stored_at,
          data.given_at,
          item.id,
        ],
      )

      await conn.execute<ResultSetHeader>(
        `
          UPDATE inventory_stocks
          SET
            inventory_quantity = ?,
            inventory_unit = ?,
            inventory_measurement = ?,
            inventory_stock_left = ?,
            inventory_transaction_date = ?,
            inventory_remarks = ?
          WHERE inventory_item_id = ?
          ORDER BY id ASC
          LIMIT 1
        `,
        [
          item.stock_quantity,
          item.unit_id,
          item.measurement,
          item.stock_quantity,
          data.given_at,
          data.remarks,
          item.id,
        ],
      )
    }

    if (removedIds.length) {
      await conn.query<ResultSetHeader>(
        `UPDATE inventory SET inventory_deleted_at = NOW() WHERE id IN (?)`,
        [removedIds],
      )
    }

    return firstId
  })
}
