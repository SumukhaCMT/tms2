import { searchCondition, sqlDate, sqlDateTime, sqlMoney } from "../../../utils/search"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import type { PoolConnection } from "mysql2/promise"

import pool from "../../../config/database"
import { searchTrusteeContacts } from "../../trustees/repositories/trusteeRepository"
import { getTempleName, getTemplesForOrganization, templeBelongsToOrganization } from "../../donations/repositories/donationRepository"

import type {
  CreateHundiData,
  CreateHundiResultRow,
  UpdateHundiData,
  HundiListItem,
  HundiListScope,
  HundiDetail,
  Hundi,
  HundiDenomination,
  HundiItem,
  DeityOption,
  DenominationCatalogItem,
  WitnessSuggestion,
  CreateHundiWitnessData,
  CreateHundiDenominationData,
  CreateHundiItemData,
  HundiWitness,
} from "../hundiTypes"

export { getTempleName, getTemplesForOrganization, templeBelongsToOrganization }

// ============================
// Deities (Basic Details step — deity multi-select, sourced from the
// `deities` table for the chosen temple, not from define_hundi).
// ============================

export const getDeitiesForTemple = async (
  organizationId: number,
  templeId: number,
): Promise<DeityOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & DeityOption)[]>(
      `
        SELECT id, deity_name AS name
        FROM deities
        WHERE organization_id = ?
          AND temple_id = ?
          AND deity_status = 'active'
          AND deleted_at IS NULL
        ORDER BY deity_display_order ASC, deity_name ASC
      `,
      [organizationId, templeId],
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Cash Denominations catalog (Cash Denominations step — the note/coin
// rows and their values are a shared catalog, not per-organization).
// ============================

export const getActiveDenominations = async (): Promise<DenominationCatalogItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & DenominationCatalogItem)[]>(
      `
        SELECT id, denomination, type, sort_order
        FROM hundi_denominations
        WHERE status = 'active'
        ORDER BY type ASC, sort_order ASC
      `,
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Resolve deity_ids -> active define_hundi records for a temple.
// A deity can have more than one defined hundi (Hundi #1, #2, ...) — all
// of them are opened together, since there's no per-hundi picker on the
// Basic Details step.
// ============================

interface DefineHundiMatch {
  id: number
  deity_id: number
  deity_name: string
  hundi_number: string
  hundi_name: string
}

export const findDefineHundisForDeities = async (
  organizationId: number,
  templeId: number,
  deityIds: number[],
): Promise<DefineHundiMatch[]> => {
  if (!deityIds.length) {
    return []
  }

  let conn

  try {
    conn = await pool.getConnection()

    const placeholders = deityIds.map(() => "?").join(", ")

    const [rows] = await conn.execute<(RowDataPacket & DefineHundiMatch)[]>(
      `
        SELECT dh.id, dh.deity_id, d.deity_name, dh.hundi_number, dh.hundi_name
        FROM define_hundi dh
        JOIN deities d ON d.id = dh.deity_id
        WHERE dh.organization_id = ?
          AND dh.temple_id = ?
          AND dh.status = 'active'
          AND dh.deleted_at IS NULL
          AND dh.deity_id IN (${placeholders})
        ORDER BY d.deity_name ASC, dh.hundi_number ASC
      `,
      [organizationId, templeId, ...deityIds],
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

const insertExtraWitnesses = async (conn: PoolConnection, hundiId: number, witnesses: CreateHundiWitnessData[]) => {
  if (!witnesses.length) return

  await conn.query<ResultSetHeader>(
    `
      INSERT INTO hundi_witnesses (
        hundi_id,
        witness_full_name,
        witness_designation,
        witness_email,
        witness_phone,
        witness_address_line1,
        witness_address_line2,
        witness_city,
        witness_remarks
      )
      VALUES ?
    `,
    [
      witnesses.map((witness) => [
        hundiId,
        witness.witness_full_name,
        witness.witness_designation ?? null,
        witness.witness_email ?? null,
        witness.witness_phone ?? null,
        witness.witness_address_line1 ?? null,
        witness.witness_address_line2 ?? null,
        witness.witness_city ?? null,
        witness.witness_remarks ?? null,
      ]),
    ],
  )
}

const insertDenominations = async (conn: PoolConnection, hundiId: number, denominations: CreateHundiDenominationData[]) => {
  if (!denominations.length) return

  const [catalog] = await conn.query<RowDataPacket[]>(
    `SELECT id, denomination FROM hundi_denominations WHERE id IN (?)`,
    [denominations.map((denomination) => denomination.denomination_id)],
  )

  const values = denominations.flatMap((denomination) => {
    const match = catalog.find((row) => row.id === denomination.denomination_id)
    return match ? [[hundiId, match.id, denomination.quantity, Number(match.denomination) * denomination.quantity]] : []
  })

  if (!values.length) return

  await conn.query<ResultSetHeader>(
    `INSERT INTO hundi_user_denominations (hundi_id, denomination_id, quantity, total_amount) VALUES ?`,
    [values],
  )
}

const insertItems = async (conn: PoolConnection, hundiId: number, items: CreateHundiItemData[]) => {
  if (!items.length) return

  await conn.query<ResultSetHeader>(
    `INSERT INTO hundi_items (hundi_id, item_name, quantity, measurement_weight, measurement, approximate_value, exact_value) VALUES ?`,
    [
      items.map((item) => [
        hundiId,
        item.item_name,
        item.quantity ?? 1,
        item.measurement_weight ?? null,
        item.measurement ?? null,
        item.approximate_value ?? null,
        item.exact_value ?? null,
      ]),
    ],
  )
}

export const insertHundiBatch = async (
  data: CreateHundiData,
  matches: DefineHundiMatch[],
): Promise<CreateHundiResultRow[]> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const results: CreateHundiResultRow[] = []

    for (const match of matches) {
      const [hundiResult] = await conn.execute<ResultSetHeader>(
        `
          INSERT INTO hundi (
            organization_id,
            temple_id,
            define_hundi_id,
            opened_at,
            witness_full_name,
            witness_designation,
            witness_email,
            witness_phone,
            witness_address_line1,
            witness_address_line2,
            witness_city,
            witness_remarks,
            summary,
            general_remark,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.organization_id,
          data.temple_id,
          match.id,
          data.opened_at,
          data.witness.witness_full_name,
          data.witness.witness_designation ?? null,
          data.witness.witness_email ?? null,
          data.witness.witness_phone ?? null,
          data.witness.witness_address_line1 ?? null,
          data.witness.witness_address_line2 ?? null,
          data.witness.witness_city ?? null,
          data.witness.witness_remarks ?? null,
          data.summary,
          data.general_remark,
          data.created_by,
        ],
      )

      const hundiId = hundiResult.insertId

      await insertExtraWitnesses(conn, hundiId, data.extra_witnesses)

      await insertDenominations(conn, hundiId, data.denominations)
      await insertItems(conn, hundiId, data.items)

      results.push({
        id: hundiId,
        define_hundi_id: match.id,
        hundi_number: match.hundi_number,
        hundi_name: match.hundi_name,
        deity_id: match.deity_id,
        deity_name: match.deity_name,
      })
    }

    await conn.commit()

    return results
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

// ============================
// List Hundis
// Mirrors the tenant-isolation rule used across donations: super_admin
// sees everything, org_admin is scoped to their organization,
// temple_admin/user are scoped to their own temple.
// ============================

export const getHundisForScope = async (
  scope: HundiListScope,
): Promise<HundiListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["h.deleted_at IS NULL"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("h.organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("h.temple_id = ?", "u.role_id <> 2")
      params.push(scope.temple_id)
    }

    const filter = searchCondition(scope.search ?? "", [sqlDateTime("opened_at"), "temp_name", "deity_name", "CONCAT(hundi_number, ' - ', hundi_name)", "witness_full_name", sqlMoney("total_cash"), sqlDate("created_at"), "created_by_name"])

    const [rows] = await conn.execute<(RowDataPacket & HundiListItem)[]>(
      `
        SELECT
          h.id,
          h.opened_at,
          h.temple_id,
          t.temp_name,
          dh.deity_id,
          d.deity_name,
          dh.hundi_number,
          dh.hundi_name,
          h.witness_full_name,
          h.created_at,
          u.user_name AS created_by_name,
          (h.signed_receipt_pdf_path IS NOT NULL) AS has_signed_receipt,
          COALESCE((
            SELECT SUM(hud.total_amount)
            FROM hundi_user_denominations hud
            WHERE hud.hundi_id = h.id
          ), 0) AS total_cash
        FROM hundi h
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        JOIN deities d ON d.id = dh.deity_id
        JOIN temples t ON t.id = h.temple_id
        JOIN users u ON u.id = h.created_by
        WHERE ${conditions.join(" AND ")}
        ${scope.search ? `HAVING ${filter.sql}` : ""}
        ORDER BY h.created_at DESC
      `,
      scope.search ? [...params, ...filter.params] : params,
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Get Hundi Detail (by ID) — full hundi row plus its define_hundi /
// deity / temple names and its denomination/item rows. Used to check
// ownership before a delete and to generate the receipt PDF.
// ============================

export const getHundiDetailById = async (id: number): Promise<HundiDetail | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [hundiRows] = await conn.execute<(RowDataPacket & Hundi & {
      hundi_number: string
      hundi_name: string
      deity_id: number
      deity_name: string
      temp_name: string
      created_by_name: string
      created_by_role_id: number
    })[]>(
      `
        SELECT h.*, EXISTS(SELECT 1 FROM hundi_image hi WHERE hi.hundi_id = h.id) AS has_image, dh.hundi_number, dh.hundi_name, dh.deity_id, d.deity_name, t.temp_name, u.user_name AS created_by_name, u.role_id AS created_by_role_id
        FROM hundi h
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        JOIN deities d ON d.id = dh.deity_id
        JOIN temples t ON t.id = h.temple_id
        JOIN users u ON u.id = h.created_by
        WHERE h.id = ? AND h.deleted_at IS NULL
        LIMIT 1
      `,
      [id],
    )

    const hundi = hundiRows[0]

    if (!hundi) {
      return null
    }

    const [denominationRows] = await conn.execute<(RowDataPacket & HundiDenomination)[]>(
      `
        SELECT hud.id, hud.hundi_id, hud.denomination_id, hd.denomination, hd.type, hud.quantity, hud.total_amount
        FROM hundi_user_denominations hud
        JOIN hundi_denominations hd ON hd.id = hud.denomination_id
        WHERE hud.hundi_id = ?
        ORDER BY hd.type ASC, hd.denomination DESC
      `,
      [id],
    )

    const [itemRows] = await conn.execute<(RowDataPacket & HundiItem)[]>(
      `SELECT * FROM hundi_items WHERE hundi_id = ?`,
      [id],
    )

    const [witnessRows] = await conn.execute<(RowDataPacket & HundiWitness)[]>(
      `SELECT * FROM hundi_witnesses WHERE hundi_id = ? ORDER BY id ASC`,
      [id],
    )

    return {
      ...hundi,
      has_image: Boolean(hundi.has_image),
      extra_witnesses: witnessRows,
      denominations: denominationRows,
      items: itemRows,
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Delete Hundi (soft delete, mirrors define_hundi/temples/organizations)
// ============================

export const deleteHundi = async (id: number): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `UPDATE hundi SET deleted_at = NOW() WHERE id = ?`,
      [id],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Update Hundi (Basic Details are fixed at creation — this replaces
// witness / denominations / item / summary / general_remark only).
// ============================

export const updateHundiRecord = async (id: number, data: UpdateHundiData): Promise<void> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.execute<ResultSetHeader>(
      `
        UPDATE hundi
        SET
          witness_full_name = ?,
          witness_designation = ?,
          witness_email = ?,
          witness_phone = ?,
          witness_address_line1 = ?,
          witness_address_line2 = ?,
          witness_city = ?,
          witness_remarks = ?,
          summary = ?,
          general_remark = ?,
          updated_by = ?
        WHERE id = ?
      `,
      [
        data.witness.witness_full_name,
        data.witness.witness_designation ?? null,
        data.witness.witness_email ?? null,
        data.witness.witness_phone ?? null,
        data.witness.witness_address_line1 ?? null,
        data.witness.witness_address_line2 ?? null,
        data.witness.witness_city ?? null,
        data.witness.witness_remarks ?? null,
        data.summary,
        data.general_remark,
        data.updated_by,
        id,
      ],
    )

    await conn.execute<ResultSetHeader>(`DELETE FROM hundi_witnesses WHERE hundi_id = ?`, [id])
    await insertExtraWitnesses(conn, id, data.extra_witnesses)

    await conn.execute<ResultSetHeader>(`DELETE FROM hundi_user_denominations WHERE hundi_id = ?`, [id])

    await insertDenominations(conn, id, data.denominations)

    await conn.execute<ResultSetHeader>(`DELETE FROM hundi_items WHERE hundi_id = ?`, [id])

    await insertItems(conn, id, data.items)

    await conn.commit()
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export const setSignedReceiptPath = async (id: number, fileName: string): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `UPDATE hundi SET signed_receipt_pdf_path = ?, signed_receipt_uploaded_at = NOW() WHERE id = ?`,
      [fileName, id],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const setHundiImageData = async (hundiIds: number[], image: Buffer): Promise<void> => {
  if (!hundiIds.length) {
    return
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    await conn.query(`DELETE FROM hundi_image WHERE hundi_id IN (?)`, [hundiIds])
    for (const hundiId of hundiIds) {
      await conn.execute(`INSERT INTO hundi_image (hundi_id, image) VALUES (?, ?)`, [hundiId, image])
    }
    await conn.commit()
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export const getHundiImageData = async (hundiId: number): Promise<Buffer | null> => {
  const [rows] = await pool.execute<(RowDataPacket & { image: Buffer })[]>(
    `SELECT image FROM hundi_image WHERE hundi_id = ? ORDER BY id DESC LIMIT 1`,
    [hundiId],
  )
  return rows[0]?.image ?? null
}

export const searchWitnesses = async (scope: HundiListScope, query: string): Promise<WitnessSuggestion[]> => {
  const userScope = scope.temple_id ? "u.temple_id = ?" : "u.organization_id = ?"
  const hundiScope = scope.temple_id ? "h.temple_id = ?" : "h.organization_id = ?"
  const scopeId = scope.temple_id || scope.organization_id
  const like = `%${query}%`

  const [users] = await pool.execute<(RowDataPacket & WitnessSuggestion)[]>(
    `
      SELECT
        u.user_name AS name,
        r.user_role_name AS designation,
        u.user_phone AS phone,
        u.user_email AS email,
        NULL AS address_line1,
        NULL AS address_line2,
        NULL AS city,
        NULL AS remarks,
        'user' AS source
      FROM users u
      JOIN default_roles r ON r.id = u.role_id
      WHERE u.deleted_at IS NULL
        AND u.user_status = 'active'
        AND u.user_name LIKE ?
        AND ${userScope}
      ORDER BY u.user_name ASC
      LIMIT 10
    `,
    [like, scopeId],
  )

  const [witnesses] = await pool.execute<(RowDataPacket & WitnessSuggestion)[]>(
    `
      SELECT
        h.witness_full_name AS name,
        h.witness_designation AS designation,
        h.witness_phone AS phone,
        h.witness_email AS email,
        h.witness_address_line1 AS address_line1,
        h.witness_address_line2 AS address_line2,
        h.witness_city AS city,
        h.witness_remarks AS remarks,
        'witness' AS source
      FROM hundi h
      JOIN (
        SELECT MAX(id) AS id
        FROM hundi h
        WHERE h.deleted_at IS NULL
          AND h.witness_full_name LIKE ?
          AND ${hundiScope}
        GROUP BY LOWER(TRIM(h.witness_full_name))
      ) latest ON latest.id = h.id
      ORDER BY h.witness_full_name ASC
      LIMIT 10
    `,
    [like, scopeId],
  )

  const [extraWitnesses] = await pool.execute<(RowDataPacket & WitnessSuggestion)[]>(
    `
      SELECT
        w.witness_full_name AS name,
        w.witness_designation AS designation,
        w.witness_phone AS phone,
        w.witness_email AS email,
        w.witness_address_line1 AS address_line1,
        w.witness_address_line2 AS address_line2,
        w.witness_city AS city,
        w.witness_remarks AS remarks,
        'witness' AS source
      FROM hundi_witnesses w
      JOIN (
        SELECT MAX(w.id) AS id
        FROM hundi_witnesses w
        JOIN hundi h ON h.id = w.hundi_id
        WHERE h.deleted_at IS NULL
          AND w.witness_full_name LIKE ?
          AND ${hundiScope}
        GROUP BY LOWER(TRIM(w.witness_full_name))
      ) latest ON latest.id = w.id
      ORDER BY w.witness_full_name ASC
      LIMIT 10
    `,
    [like, scopeId],
  )

  const trustees = (await searchTrusteeContacts(scope, query)).map(
    (trustee): WitnessSuggestion => ({ ...trustee, remarks: null, source: "trustee" }),
  )

  const byName = new Map<string, WitnessSuggestion>()

  for (const entry of [...users, ...trustees, ...witnesses, ...extraWitnesses]) {
    const key = entry.name.trim().toLowerCase()
    const existing = byName.get(key)
    if (!existing) {
      byName.set(key, { ...entry })
      continue
    }
    for (const field of ["designation", "phone", "email", "address_line1", "address_line2", "city", "remarks"] as const) {
      existing[field] = existing[field] ?? entry[field]
    }
  }

  return [...byName.values()]
}
