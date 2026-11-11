import { cached, clearCache } from "../../../utils/cache"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"

import type { MeasurementUnitOption, NewMeasurementUnits } from "../inventoryTypes"

export const getMeasurementUnitsForOrganization = (organizationId: number | null): Promise<MeasurementUnitOption[]> =>
  cached(`units:${organizationId ?? 0}`, () => loadMeasurementUnits(organizationId))

const loadMeasurementUnits = async (organizationId: number | null): Promise<MeasurementUnitOption[]> => {
  const [rows] = await pool.execute<(RowDataPacket & MeasurementUnitOption)[]>(
    `
      SELECT u.id, u.unit_name, u.conversion_factor, u.is_base, m.id AS measurement_id, m.organization_id
      FROM inventory_measurement_units u
      JOIN inventory_measurements m ON m.id = u.measurement_id
      WHERE m.deleted_at IS NULL AND (m.organization_id IS NULL OR m.organization_id = ?)
      ORDER BY m.id ASC, u.is_base DESC, u.conversion_factor ASC
    `,
    [organizationId ?? 0],
  )

  return rows.map((row) => ({ ...row, conversion_factor: Number(row.conversion_factor) }))
}

export const insertMeasurementUnits = async (
  organizationId: number | null,
  createdBy: number,
  groups: NewMeasurementUnits[],
): Promise<void> => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    for (const group of groups) {
      let measurementId = group.measurement_id

      if (!measurementId) {
        const [result] = await conn.execute<ResultSetHeader>(
          `INSERT INTO inventory_measurements (organization_id, created_by) VALUES (?, ?)`,
          [organizationId, createdBy],
        )
        measurementId = result.insertId
      }

      await conn.query(
        `INSERT INTO inventory_measurement_units (measurement_id, unit_name, conversion_factor, is_base) VALUES ?`,
        [group.units.map((unit) => [measurementId, ...unit])],
      )
    }

    await conn.commit()
    clearCache("units:")
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export const getMeasurementUnitById = async (id: number): Promise<{ measurement_id: number; conversion_factor: number } | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT measurement_id, conversion_factor FROM inventory_measurement_units WHERE id = ? LIMIT 1`,
    [id],
  )

  const row = rows[0]
  return row ? { measurement_id: Number(row.measurement_id), conversion_factor: Number(row.conversion_factor) } : null
}
