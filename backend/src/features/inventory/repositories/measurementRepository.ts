import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"

import type { CreateMeasurementData, MeasurementUnitOption } from "../inventoryTypes"

export const getMeasurementUnitsForOrganization = async (organizationId: number | null): Promise<MeasurementUnitOption[]> => {
  const [rows] = await pool.execute<(RowDataPacket & MeasurementUnitOption)[]>(
    `
      SELECT u.id, u.unit_name, u.conversion_factor, u.is_base, m.id AS measurement_id, m.measurement_name
      FROM inventory_measurement_units u
      JOIN inventory_measurements m ON m.id = u.measurement_id
      WHERE m.deleted_at IS NULL AND (m.organization_id IS NULL OR m.organization_id = ?)
      ORDER BY m.measurement_name ASC, u.is_base DESC, u.conversion_factor ASC
    `,
    [organizationId ?? 0],
  )

  return rows.map((row) => ({ ...row, conversion_factor: Number(row.conversion_factor) }))
}

export const isMeasurementNameTaken = async (organizationId: number | null, name: string): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT id FROM inventory_measurements
      WHERE deleted_at IS NULL AND LOWER(measurement_name) = LOWER(?) AND (organization_id IS NULL OR organization_id = ?)
      LIMIT 1
    `,
    [name, organizationId ?? 0],
  )

  return rows.length > 0
}

export const findTakenUnitNames = async (organizationId: number | null, names: string[]): Promise<string[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT u.unit_name
      FROM inventory_measurement_units u
      JOIN inventory_measurements m ON m.id = u.measurement_id
      WHERE m.deleted_at IS NULL AND (m.organization_id IS NULL OR m.organization_id = ?) AND LOWER(u.unit_name) IN (?)
    `,
    [organizationId ?? 0, names.map((name) => name.toLowerCase())],
  )

  return rows.map((row) => String(row.unit_name))
}

export const insertMeasurement = async (data: CreateMeasurementData): Promise<number> => {
  const conn = await pool.getConnection()
  await conn.beginTransaction()

  const units = [
    [data.base_unit_name, 1, 1],
    ...data.conversions.map((row) => [row.unit_name, row.conversion_factor, 0]),
  ]

  return conn
    .execute<ResultSetHeader>(
      `INSERT INTO inventory_measurements (organization_id, measurement_name, created_by) VALUES (?, ?, ?)`,
      [data.organization_id, data.measurement_name, data.created_by],
    )
    .then(async ([result]) => {
      await conn.query(
        `INSERT INTO inventory_measurement_units (measurement_id, unit_name, conversion_factor, is_base) VALUES ?`,
        [units.map((unit) => [result.insertId, ...unit])],
      )
      await conn.commit()
      return result.insertId
    })
    .catch(async (error) => {
      await conn.rollback()
      throw error
    })
    .finally(() => conn.release())
}

export const getMeasurementUnitById = async (id: number): Promise<{ measurement_id: number; conversion_factor: number } | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT measurement_id, conversion_factor FROM inventory_measurement_units WHERE id = ? LIMIT 1`,
    [id],
  )

  const row = rows[0]
  return row ? { measurement_id: Number(row.measurement_id), conversion_factor: Number(row.conversion_factor) } : null
}
