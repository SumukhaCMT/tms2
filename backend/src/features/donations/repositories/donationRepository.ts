import { searchCondition, sqlDate } from "../../../utils/search"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"
import { searchTrusteeContacts } from "../../trustees/repositories/trusteeRepository"

import type {
  CreateDonationPayload,
  CreateDonationResult,
  DonationListItem,
  DonationListScope,
  DonationMonetary,
  DonationInkind,
  UpdateDonationPayload,
  DonationDetail,
  TempleOption,
  MeasurementUnit,
  TempleUserOption,
  DonorSuggestion,
} from "../donationsTypes"



export const insertDonationWithDetails = async (
  payload: CreateDonationPayload,
): Promise<CreateDonationResult> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const { donation, donation_monetary, donation_inkind } = payload

    const [donationResult] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO donations (
          organization_id,
          temple_id,
          user_id,
          donation_number,
          donor_name,
          donor_phone,
          donor_email,
          donor_pincode,
          donor_state,
          donor_city,
          donor_address_line1,
          donor_address_line2,
          monetary,
          inkind,
          stored_at,
          receiver_user_id,
          receiver_name,
          receiver_phone,
          receiver_designation,
          overall_remarks,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        donation.organization_id,
        donation.temple_id,
        donation.user_id,
        donation.donation_number,
        donation.donor_name,
        donation.donor_phone,
        donation.donor_email ?? null,
        donation.donor_pincode,
        donation.donor_state,
        donation.donor_city,
        donation.donor_address_line1 ?? null,
        donation.donor_address_line2 ?? null,
        donation.monetary,
        donation.inkind,
        donation.stored_at,
        donation.receiver_user_id ?? null,
        donation.receiver_name ?? null,
        donation.receiver_phone ?? null,
        donation.receiver_designation ?? null,
        donation.overall_remarks ?? null,
        donation.created_by,
      ],
    )

    const donationId = donationResult.insertId

    if (donation_monetary) {
      await conn.execute<ResultSetHeader>(
        `
          INSERT INTO donation_monetary (
            donation_id,
            donation_method,
            donation_monetary_amount,
            donation_monetary_bank_name,
            donation_monetary_reference_number,
            donation_monetary_reference_date,
            donation_monetary_remarks,
            donor_pan_number,
            donor_aadhaar_number
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          donationId,
          donation_monetary.donation_method,
          donation_monetary.donation_monetary_amount,
          donation_monetary.donation_monetary_bank_name,
          donation_monetary.donation_monetary_reference_number,
          donation_monetary.donation_monetary_reference_date,
          donation_monetary.donation_monetary_remarks ?? null,
          donation_monetary.donor_pan_number ?? null,
          donation_monetary.donor_aadhaar_number ?? null,
        ],
      )
    }

    if (donation_inkind?.length) {
      await conn.query<ResultSetHeader>(
        `
          INSERT INTO donation_inkind (
            donation_id,
            item_type,
            item_title,
            measurement,
            measurement_unit,
            quantity,
            approximate_Market_value,
            estimated_value,
            remarks
          )
          VALUES ?
        `,
        [
          donation_inkind.map((item) => [
            donationId,
            item.item_type,
            item.item_title,
            item.measurement,
            item.measurement_unit,
            item.quantity,
            item.approximate_Market_value,
            item.estimated_value ?? 0,
            item.remarks ?? null,
          ]),
        ],
      )

      if (payload.add_to_inventory) {
        const item = donation_inkind[0]
        const [unitRows] = await conn.execute<(RowDataPacket & { id: number })[]>(
          `SELECT id FROM inventory_measurement_units WHERE unit_name = ? LIMIT 1`,
          [item.measurement_unit],
        )
        if (!unitRows.length) {
          const error = new Error("Selected measurement unit is not available in inventory") as Error & { code: string }
          error.code = "INVENTORY_UNIT_NOT_FOUND"
          throw error
        }

        const inventoryItemType = item.item_type === "fixed" ? "non_consumable" : "consumable"
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            donation.organization_id,
            donation.temple_id,
            donation.created_by,
            item.item_title,
            item.item_title.trim().toLowerCase().replace(/\s+/g, "-"),
            inventoryItemType,
            unitRows[0].id,
            item.measurement,
            item.quantity,
            donation.donor_name,
            donation.stored_at,
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
          `,
          [
            donation.organization_id,
            donation.temple_id,
            inventoryResult.insertId,
            donation.created_by,
            item.quantity,
            unitRows[0].id,
            item.measurement,
            item.quantity,
            [item.remarks, `Donation ${donation.donation_number}`].filter(Boolean).join(" · "),
          ],
        )
      }
    }

    await conn.commit()

    return {
      id: donationId,
      donation_number: donation.donation_number,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

// ============================
// Check Donation Number Exists
// Used by the controller to return a clean 409 instead of a raw duplicate
// key error when the (client-suggested) donation number collides.
// ============================

export const donationNumberExists = async (
  donationNumber: string,
): Promise<boolean> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT 1 FROM donations WHERE donation_number = ? LIMIT 1`,
      [donationNumber],
    )

    return rows.length > 0
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getDonationsForScope = async (
  scope: DonationListScope,
): Promise<DonationListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("d.organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("d.temple_id = ?", "COALESCE(u.role_id, 0) <> 2")
      params.push(scope.temple_id)
    }

    if (scope.search) {
      const filter = searchCondition(scope.search, ["t.temp_name", "d.donation_number", "d.donor_name", "d.donor_phone", "d.donor_email", "d.donor_city", "d.donor_state", "dv.devotee_name", "CASE WHEN d.monetary AND d.inkind THEN 'Both' WHEN d.inkind THEN 'In-Kind' ELSE 'Monetary' END", "d.stored_at", sqlDate("d.created_at"), "u.user_name"])
      conditions.push(filter.sql)
      params.push(...filter.params)
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : ""

    const [rows] = await conn.execute<(RowDataPacket & DonationListItem)[]>(
      `
        SELECT
          d.id,
          d.donation_number,
          d.donor_name,
          d.donor_phone,
          d.donor_email,
          d.donor_city,
          d.donor_state,
          d.monetary,
          d.inkind,
          d.stored_at,
          d.created_at,
          t.temp_name,
          u.user_name AS created_by_name
      FROM donations d
JOIN temples t ON t.id = d.temple_id
LEFT JOIN users u ON u.id = d.created_by
LEFT JOIN devotees dv
  ON dv.organization_id = d.organization_id
  AND (dv.temple_id = d.temple_id OR dv.temple_id IS NULL)
  AND dv.devotee_name = d.donor_name
  AND dv.deleted_at IS NULL
        ${whereClause}
        ORDER BY d.created_at DESC
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


// ============================
// Get Donation Detail (by ID)
// Full donation row plus its monetary row (if any) and inkind rows —
// used to prefill the edit wizard and to check organization_id/temple_id
// ownership before an update or delete.
// ============================

export const getDonationDetailById = async (
  id: number,
): Promise<DonationDetail | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [donationRows] = await conn.execute<(RowDataPacket & Omit<DonationDetail, "donation_monetary" | "donation_inkind">)[]>(
      `SELECT d.*, t.temp_name, u.user_name AS created_by_name, u.role_id AS created_by_role_id FROM donations d JOIN temples t ON t.id = d.temple_id LEFT JOIN users u ON u.id = d.created_by WHERE d.id = ? LIMIT 1`,
      [id],
    )

    const donation = donationRows[0]

    if (!donation) {
      return null
    }

    const [monetaryRows] = await conn.execute<(RowDataPacket & DonationMonetary)[]>(
      `SELECT * FROM donation_monetary WHERE donation_id = ? LIMIT 1`,
      [id],
    )

    const [inkindRows] = await conn.execute<(RowDataPacket & DonationInkind)[]>(
      `SELECT * FROM donation_inkind WHERE donation_id = ?`,
      [id],
    )

    return {
      ...donation,
      donation_monetary: monetaryRows[0] ?? null,
      donation_inkind: inkindRows,
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Update Donation
// Updates the editable donor/donation fields, then replaces whatever
// monetary/inkind detail rows existed before with whatever the edited
// wizard now submits — simpler and safer than diffing a partial update
// against a variable-length inkind array, and mirrors how the create
// path already builds these rows.
// ============================

export const updateDonationWithDetails = async (
  id: number,
  payload: UpdateDonationPayload,
): Promise<void> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const { donation, donation_monetary, donation_inkind } = payload

    await conn.execute<ResultSetHeader>(
      `
        UPDATE donations
        SET
          donor_name = ?,
          donor_phone = ?,
          donor_email = ?,
          donor_pincode = ?,
          donor_state = ?,
          donor_city = ?,
          donor_address_line1 = ?,
          donor_address_line2 = ?,
          monetary = ?,
          inkind = ?,
          stored_at = ?,
          overall_remarks = ?,
          updated_by = ?
        WHERE id = ?
      `,
      [
        donation.donor_name,
        donation.donor_phone,
        donation.donor_email ?? null,
        donation.donor_pincode,
        donation.donor_state,
        donation.donor_city,
        donation.donor_address_line1 ?? null,
        donation.donor_address_line2 ?? null,
        donation.monetary,
        donation.inkind,
        donation.stored_at,
        donation.overall_remarks ?? null,
        donation.updated_by,
        id,
      ],
    )

    await conn.execute<ResultSetHeader>(
      `DELETE FROM donation_monetary WHERE donation_id = ?`,
      [id],
    )
    await conn.execute<ResultSetHeader>(
      `DELETE FROM donation_inkind WHERE donation_id = ?`,
      [id],
    )

    if (donation_monetary) {
      await conn.execute<ResultSetHeader>(
        `
          INSERT INTO donation_monetary (
            donation_id,
            donation_method,
            donation_monetary_amount,
            donation_monetary_bank_name,
            donation_monetary_reference_number,
            donation_monetary_reference_date,
            donation_monetary_remarks,
            donor_pan_number,
            donor_aadhaar_number
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          donation_monetary.donation_method,
          donation_monetary.donation_monetary_amount,
          donation_monetary.donation_monetary_bank_name,
          donation_monetary.donation_monetary_reference_number,
          donation_monetary.donation_monetary_reference_date,
          donation_monetary.donation_monetary_remarks ?? null,
          donation_monetary.donor_pan_number ?? null,
          donation_monetary.donor_aadhaar_number ?? null,
        ],
      )
    }

    if (donation_inkind?.length) {
      await conn.query<ResultSetHeader>(
        `
          INSERT INTO donation_inkind (
            donation_id,
            item_type,
            item_title,
            measurement,
            measurement_unit,
            quantity,
            approximate_Market_value,
            estimated_value,
            remarks
          )
          VALUES ?
        `,
        [
          donation_inkind.map((item) => [
            id,
            item.item_type,
            item.item_title,
            item.measurement,
            item.measurement_unit,
            item.quantity,
            item.approximate_Market_value,
            item.estimated_value ?? 0,
            item.remarks ?? null,
          ]),
        ],
      )
    }

    await conn.commit()
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

// ============================
// Delete Donation
// Removes the monetary/inkind detail rows first, then the donation row
// itself, all inside one transaction (belt-and-braces even if the FKs
// already cascade).
// ============================

export const deleteDonationWithDetails = async (id: number): Promise<void> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.execute<ResultSetHeader>(
      `DELETE FROM donation_monetary WHERE donation_id = ?`,
      [id],
    )
    await conn.execute<ResultSetHeader>(
      `DELETE FROM donation_inkind WHERE donation_id = ?`,
      [id],
    )
    await conn.execute<ResultSetHeader>(
      `DELETE FROM donations WHERE id = ?`,
      [id],
    )

    await conn.commit()
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}


// ============================
// Get Temples For Organization
// Powers the org_admin "Temple" picker on the donor-details step - an
// org_admin isn't pinned to one temple, so they choose which of their
// organization's active temples a donation belongs to.
// ============================

export const getTemplesForOrganization = async (
  organizationId: number,
): Promise<TempleOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & TempleOption)[]>(
      `
        SELECT id, temp_name
        FROM temples
        WHERE organization_id = ?
          AND temp_status = 'active'
          AND deleted_at IS NULL
        ORDER BY temp_name ASC
      `,
      [organizationId],
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Temple Belongs To Organization
// Guards against an org_admin submitting a temple_id that isn't theirs.
// ============================

export const templeBelongsToOrganization = async (
  templeId: number,
  organizationId: number,
): Promise<boolean> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `
        SELECT id
        FROM temples
        WHERE id = ?
          AND organization_id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [templeId, organizationId],
    )

    return rows.length > 0
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Measurement Units
// Backs the in-kind "Measurement Unit" dropdown. Seeded units come back
// first (is_custom = 0), then custom ones alphabetically.
// ============================

export const getMeasurementUnits = async (): Promise<MeasurementUnit[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & MeasurementUnit)[]>(
      `
        SELECT id, unit_name, is_custom
        FROM donation_measurement_units
        ORDER BY is_custom ASC, unit_name ASC
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
// Create Measurement Unit
// unit_name is unique (case-insensitive, per the table's ci collation),
// so re-adding an existing unit is a no-op that just returns the
// existing row instead of erroring.
// ============================

export const createMeasurementUnit = async (
  unitName: string,
  createdBy: number | null,
): Promise<MeasurementUnit> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `
        INSERT INTO donation_measurement_units (unit_name, is_custom, created_by)
        VALUES (?, 1, ?)
        ON DUPLICATE KEY UPDATE unit_name = unit_name
      `,
      [unitName, createdBy],
    )

    const [rows] = await conn.execute<(RowDataPacket & MeasurementUnit)[]>(
      `SELECT id, unit_name, is_custom FROM donation_measurement_units WHERE unit_name = ? LIMIT 1`,
      [unitName],
    )

    return rows[0]
  } finally {
    if (conn) {
      conn.release()
    }
  }
}


// ============================
// User Basic Info
// Used to default the receiver to whoever is actually filling out the
// form when the "Receiver Details" step is left blank.
// ============================

export const getUserBasicInfo = async (
  userId: number,
): Promise<{ id: number; user_name: string; user_phone: string | null } | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `
        SELECT id, user_name, user_phone
        FROM users
        WHERE id = ? AND deleted_at IS NULL
        LIMIT 1
      `,
      [userId],
    )

    return (rows[0] as { id: number; user_name: string; user_phone: string | null }) ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Search Receiver Candidates
// Backs the receiver-name autocomplete on the "Receiver Details" step.
// Only two kinds of user are searchable as a receiver: temple_admins
// (role_id 3) of the logged-in caller's own temple, and org_admins
// (role_id 2) of the caller's own organization - never an arbitrary
// user of any temple. `designation` (default_roles.user_role_name) is
// returned so the frontend can auto-fill Receiver Designation from the
// matched user's actual role.
// ============================

export const searchReceiverCandidates = async (
  scope: { organizationId: number | null; templeId: number | null },
  query: string,
): Promise<TempleUserOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & TempleUserOption)[]>(
      `
        SELECT u.id, u.user_name, u.user_phone, r.user_role_name AS designation, 'user' AS source
        FROM users u
        JOIN default_roles r ON r.id = u.role_id
        WHERE u.deleted_at IS NULL
          AND u.user_status = 'active'
          AND u.user_name LIKE ?
          AND (
            u.temple_id = ?
            OR (u.temple_id IS NULL AND u.organization_id = ?)
          )
        ORDER BY u.user_name ASC
        LIMIT 10
      `,
      [`%${query}%`, scope.templeId, scope.organizationId],
    )

    const [receivers] = await conn.execute<(RowDataPacket & TempleUserOption)[]>(
      `
        SELECT NULL AS id, d.receiver_name AS user_name, d.receiver_phone AS user_phone, d.receiver_designation AS designation, 'receiver' AS source
        FROM donations d
        JOIN (
          SELECT MAX(id) AS id
          FROM donations
          WHERE receiver_user_id IS NULL
            AND receiver_name LIKE ?
            AND ${scope.templeId ? "temple_id = ?" : "organization_id = ?"}
          GROUP BY LOWER(TRIM(receiver_name))
        ) latest ON latest.id = d.id
        ORDER BY d.receiver_name ASC
        LIMIT 10
      `,
      [`%${query}%`, scope.templeId || scope.organizationId],
    )

    const trustees = (
      await searchTrusteeContacts({ organization_id: scope.organizationId, temple_id: scope.templeId }, query)
    ).map((trustee): TempleUserOption => ({
      id: null,
      user_name: trustee.name,
      user_phone: trustee.phone,
      designation: trustee.designation,
      source: "trustee",
    }))

    const byName = new Map<string, TempleUserOption>()
    for (const entry of [...rows, ...trustees, ...receivers]) {
      const key = entry.user_name.trim().toLowerCase()
      if (!byName.has(key)) byName.set(key, entry)
    }

    return [...byName.values()]
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Get Receiver Candidate Designation
// Re-validates a client-supplied receiver_user_id server-side against
// the same rule as the search above (temple_admin of the caller's own
// temple, or org_admin of the caller's own organization) and returns
// that role's display name - which becomes the authoritative
// receiver_designation, overriding anything the client sent. Returns
// null if the id doesn't match a valid candidate.
// ============================

export const getReceiverCandidateDesignation = async (
  userId: number,
  scope: { organizationId: number | null; templeId: number | null },
): Promise<string | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `
        SELECT r.user_role_name AS designation
        FROM users u
        JOIN default_roles r ON r.id = u.role_id
        WHERE u.id = ?
          AND u.deleted_at IS NULL
          AND u.user_status = 'active'
          AND (
            u.temple_id = ?
            OR (u.temple_id IS NULL AND u.organization_id = ?)
          )
        LIMIT 1
      `,
      [userId, scope.templeId, scope.organizationId],
    )

    return (rows[0]?.designation as string | undefined) ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Search Donors
// Backs the donor-name autocomplete on the "Donor Details" step, so a
// repeat donor's details don't have to be typed in from scratch. Scoped
// the same way the donations list is: org_admin sees their whole
// organization, everyone else only their own temple. Returns the most
// recent donation row per matching donor name/phone pair.
// ============================

export const searchDonorsByName = async (
  scope: DonationListScope,
  query: string,
): Promise<DonorSuggestion[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const donorConditions: string[] = ["donor_name LIKE ?"]
    const donorParams: (string | number)[] = [`%${query}%`]

    if (!scope.temple_id && scope.organization_id) {
      donorConditions.push("organization_id = ?")
      donorParams.push(scope.organization_id)
    } else if (scope.temple_id) {
      donorConditions.push("temple_id = ?")
      donorParams.push(scope.temple_id)
    }

    const devoteeConditions: string[] = [
      "devotee_name LIKE ?",
      "devotee_name IS NOT NULL",
      "devotee_status = 'active'",
      "deleted_at IS NULL",
    ]
    const devoteeParams: (string | number)[] = [`%${query}%`]

    if (!scope.temple_id && scope.organization_id) {
      devoteeConditions.push("organization_id = ?")
      devoteeParams.push(scope.organization_id)
    } else if (scope.temple_id) {
      devoteeConditions.push("organization_id = ?", "(temple_id = ? OR temple_id IS NULL)")
      devoteeParams.push(scope.organization_id, scope.temple_id)
    }

    const [devoteeRows] = await conn.execute<(RowDataPacket & Omit<DonorSuggestion, "source"> & { updated_at: Date })[]>(
      `
        SELECT
          devotee_name AS donor_name,
          devotee_phone AS donor_phone,
          devotee_email AS donor_email,
          devotee_pincode AS donor_pincode,
          devotee_state AS donor_state,
          devotee_city AS donor_city,
          devotee_address_line1 AS donor_address_line1,
          devotee_address_line2 AS donor_address_line2,
          updated_at
        FROM devotees
        WHERE ${devoteeConditions.join(" AND ")}
        ORDER BY updated_at DESC
        LIMIT 30
      `,
      devoteeParams,
    )

    const [donationRows] = await conn.execute<(RowDataPacket & Omit<DonorSuggestion, "source"> & { created_at: Date })[]>(
      `
        SELECT
          donor_name,
          donor_phone,
          donor_email,
          donor_pincode,
          donor_state,
          donor_city,
          donor_address_line1,
          donor_address_line2,
          created_at
        FROM donations
        WHERE ${donorConditions.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT 30
      `,
      donorParams,
    )

    // Prefer current devotee profile details over historical donation details.
    const seen = new Set<string>()
    const donors: DonorSuggestion[] = []

    for (const [rows, source] of [[devoteeRows, "devotee"], [donationRows, "donation"]] as const) {
      for (const row of rows) {
        const key = `${row.donor_name.toLowerCase()}|${row.donor_phone ?? ""}`
        if (seen.has(key)) continue
        seen.add(key)
        donors.push({
          source,
          donor_name: row.donor_name,
          donor_phone: row.donor_phone,
          donor_email: row.donor_email,
          donor_pincode: row.donor_pincode,
          donor_state: row.donor_state,
          donor_city: row.donor_city,
          donor_address_line1: row.donor_address_line1,
          donor_address_line2: row.donor_address_line2,
        })
        if (donors.length >= 10) break
      }
      if (donors.length >= 10) break
    }

    return donors
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Get Temple Name
// Used on the acknowledgement receipt PDF's header.
// ============================

export const getTempleName = async (templeId: number): Promise<string | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT temp_name FROM temples WHERE id = ? LIMIT 1`,
      [templeId],
    )

    return (rows[0]?.temp_name as string | undefined) ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

// ============================
// Set Donation Receipt Path
// Records which generated PDF (by filename, under the backend's own
// receipts storage folder) belongs to a donation, so a later download
// doesn't have to regenerate it from scratch.
// ============================

export const setDonationReceiptPath = async (
  donationId: number,
  fileName: string | null,
): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      fileName
        ? `UPDATE donations SET receipt_pdf_path = ?, receipt_generated_at = NOW() WHERE id = ?`
        : `UPDATE donations SET receipt_pdf_path = NULL, receipt_generated_at = NULL WHERE id = ?`,
      fileName ? [fileName, donationId] : [donationId],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
