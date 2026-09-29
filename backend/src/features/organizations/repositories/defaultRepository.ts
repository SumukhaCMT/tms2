import type {
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise"

export interface SystemDefaultRow
  extends RowDataPacket {
  id: number
  key_name: string
  value_int: number
}

export const defaultRepository = {
  async findAll(
    conn: PoolConnection,
  ): Promise<SystemDefaultRow[]> {
    const [rows] =
      await conn.execute<SystemDefaultRow[]>(
        `
        SELECT
          id,
          key_name,
          value_int
        FROM system_defaults
        ORDER BY id ASC
        `,
      )

    return rows
  },

  async findByKey(
    conn: PoolConnection,
    keyName: string,
  ): Promise<SystemDefaultRow | null> {
    const [rows] =
      await conn.execute<SystemDefaultRow[]>(
        `
        SELECT
          id,
          key_name,
          value_int
        FROM system_defaults
        WHERE key_name = ?
        LIMIT 1
        `,
        [keyName],
      )

    return rows[0] ?? null
  },
}