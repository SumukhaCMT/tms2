import type { RowDataPacket } from "mysql2"
import pool from "../../../config/database"
import type { UniqueTarget } from "../validationRules"

export const valueExists = async (target: UniqueTarget, value: string, excludeId?: number, organizationId?: number) => {
  const conditions = [`LOWER(TRIM(${target.column})) = LOWER(?)`, "deleted_at IS NULL"]
  const params: (string | number)[] = [value]

  if (target.scoped && organizationId) {
    conditions.push("organization_id = ?")
    params.push(organizationId)
  }

  if (excludeId) {
    conditions.push("id <> ?")
    params.push(excludeId)
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1 FROM ${target.table} WHERE ${conditions.join(" AND ")} LIMIT 1`,
    params,
  )

  return rows.length > 0
}
