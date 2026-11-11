import type { RowDataPacket } from "mysql2"

import pool from "../../config/database"

export async function getTempleContact(templeId: number): Promise<string[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT temp_address_line1, temp_address_line2, temp_city, temp_state, temp_pincode, temp_phone FROM temples WHERE id = ? LIMIT 1`,
    [templeId],
  )
  const temple = rows[0]
  if (!temple) return []
  const address = [temple.temp_address_line1, temple.temp_address_line2, temple.temp_city, temple.temp_state, temple.temp_pincode]
    .filter((part) => part && String(part).trim())
    .join(", ")
  return [address, temple.temp_phone ? `Phone: ${temple.temp_phone}` : ""].filter(Boolean)
}
