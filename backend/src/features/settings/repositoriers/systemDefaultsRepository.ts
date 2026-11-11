import db from "../../../config/database"
import type {
  CreateSystemDefaultPayload,
  UpdateSystemDefaultPayload,
  SystemDefaultListParams,
} from "../systemDefaultsTypes"

export const systemDefaultsRepository = {
  async findAll(params: SystemDefaultListParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = params

    const offset = (page - 1) * limit

    let where = ""
    const values: unknown[] = []

    if (search) {
      where = `
        WHERE
          key_name LIKE ?
          OR description LIKE ?
      `

      const searchValue = `%${search}%`

      values.push(searchValue, searchValue)
    }

    const [rows] = await db.query(
      `
        SELECT
          id,
          key_name,
          value_int,
          description,
          created_at,
          updated_at
        FROM system_defaults
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    )

    const [countRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM system_defaults
        ${where}
      `,
      values,
    )

    return {
      rows,
      total: Number(
        (countRows as Array<{ total: number }>)[0]?.total ?? 0,
      ),
    }
  },

  async findById(id: number) {
    const [rows] = await db.query(
      `
        SELECT
          id,
          key_name,
          value_int,
          description,
          created_at,
          updated_at
        FROM system_defaults
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    )

    return (rows as unknown[])[0] ?? null
  },

  async findByKey(keyName: string) {
    const [rows] = await db.query(
      `
        SELECT
          id,
          key_name,
          value_int,
          description,
          created_at,
          updated_at
        FROM system_defaults
        WHERE key_name = ?
        LIMIT 1
      `,
      [keyName],
    )

    return (rows as unknown[])[0] ?? null
  },

  async create(data: CreateSystemDefaultPayload) {
    const [result] = await db.query(
      `
        INSERT INTO system_defaults
        (
          key_name,
          value_int,
          description
        )
        VALUES (?, ?, ?)
      `,
      [
        data.key_name,
        data.value_int,
        data.description ?? null,
      ],
    )

    return result
  },

  async update(
    id: number,
    data: UpdateSystemDefaultPayload,
  ) {
    const [result] = await db.query(
      `
        UPDATE system_defaults
        SET
          value_int = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.value_int,
        data.description ?? null,
        id,
      ],
    )

    return result
  },

  async delete(id: number) {
    const [result] = await db.query(
      `
        DELETE FROM system_defaults
        WHERE id = ?
      `,
      [id],
    )

    return result
  },


  
}