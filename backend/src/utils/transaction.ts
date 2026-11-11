import type { PoolConnection } from "mysql2/promise"
import db from "../config/database"

export const withTransaction = async <T>(work: (conn: PoolConnection) => Promise<T>) => {
  const conn = await db.getConnection()
  await conn.beginTransaction()
  return work(conn)
    .then(async (result) => {
      await conn.commit()
      return result
    })
    .catch(async (error: unknown) => {
      await conn.rollback()
      throw error
    })
    .finally(() => conn.release())
}
