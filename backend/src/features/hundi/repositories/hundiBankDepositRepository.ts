import type { ResultSetHeader, RowDataPacket } from "mysql2"

import pool from "../../../config/database"

import type {
  IncompleteHundiOption,
  HundiRemaining,
  HundiBankDepositListItem,
  HundiBankDepositDetail,
  DepositedByOption,
  CreateHundiBankDepositData,
  UpdateHundiBankDepositData,
  HundiListScope,
} from "../hundiTypes"

const CASH_SUBQUERY = `
  SELECT hundi_id, SUM(total_amount) AS total_cash
  FROM hundi_user_denominations
  GROUP BY hundi_id
`

const DEPOSITS_SUBQUERY = `
  SELECT hundi_id, SUM(deposit_amount) AS deposited_amount
  FROM hundi_bank_deposits
  GROUP BY hundi_id
`

export const getIncompleteHundisForScope = async (
  scope: HundiListScope,
): Promise<IncompleteHundiOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["h.deleted_at IS NULL"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("h.organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("h.temple_id = ?")
      params.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & IncompleteHundiOption)[]>(
      `
        SELECT
          h.id,
          h.temple_id,
          t.temp_name,
          dh.hundi_number,
          dh.hundi_name,
          d.name AS deity_name,
          h.opened_at,
          COALESCE(cash.total_cash, 0) AS total_cash,
          COALESCE(deposits.deposited_amount, 0) AS deposited_amount,
          COALESCE(cash.total_cash, 0) - COALESCE(deposits.deposited_amount, 0) AS remaining_amount
        FROM hundi h
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        JOIN deities d ON d.id = dh.deity_id
        JOIN temples t ON t.id = h.temple_id
        LEFT JOIN (${CASH_SUBQUERY}) cash ON cash.hundi_id = h.id
        LEFT JOIN (${DEPOSITS_SUBQUERY}) deposits ON deposits.hundi_id = h.id
        WHERE ${conditions.join(" AND ")}
        HAVING remaining_amount > 0
        ORDER BY h.opened_at DESC
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

export const getHundiRemainingById = async (hundiId: number): Promise<HundiRemaining | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & HundiRemaining)[]>(
      `
        SELECT
          h.id,
          h.organization_id,
          h.temple_id,
          dh.deity_id,
          COALESCE(cash.total_cash, 0) AS total_cash,
          COALESCE(deposits.deposited_amount, 0) AS deposited_amount,
          COALESCE(cash.total_cash, 0) - COALESCE(deposits.deposited_amount, 0) AS remaining_amount
        FROM hundi h
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        LEFT JOIN (${CASH_SUBQUERY}) cash ON cash.hundi_id = h.id
        LEFT JOIN (${DEPOSITS_SUBQUERY}) deposits ON deposits.hundi_id = h.id
        WHERE h.id = ? AND h.deleted_at IS NULL
        LIMIT 1
      `,
      [hundiId],
    )

    return rows[0] ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getHundiBankDepositsForScope = async (
  scope: HundiListScope,
): Promise<HundiBankDepositListItem[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const conditions: string[] = ["1 = 1"]
    const params: (string | number)[] = []

    if (!scope.temple_id && scope.organization_id) {
      conditions.push("hbd.organization_id = ?")
      params.push(scope.organization_id)
    } else if (scope.temple_id) {
      conditions.push("hbd.temple_id = ?")
      params.push(scope.temple_id)
    }

    const [rows] = await conn.execute<(RowDataPacket & HundiBankDepositListItem)[]>(
      `
        SELECT
          hbd.id,
          hbd.temple_id,
          t.temp_name,
          hbd.hundi_id,
          dh.hundi_number,
          dh.hundi_name,
          COALESCE(cash.total_cash, 0) AS total_cash,
          hbd.deposit_amount,
          COALESCE(cash.total_cash, 0) - (
            SELECT COALESCE(SUM(prev.deposit_amount), 0)
            FROM hundi_bank_deposits prev
            WHERE prev.hundi_id = hbd.hundi_id
              AND (prev.created_at < hbd.created_at OR (prev.created_at = hbd.created_at AND prev.id <= hbd.id))
          ) AS remaining_amount,
          hbd.bank_name,
          hbd.account_holder_name,
          hbd.account_number,
          hbd.ifsc_code,
          hbd.transaction_number,
          hbd.deposit_date,
          hbd.remarks,
          u.user_name AS deposited_by_name,
          hbd.created_at
        FROM hundi_bank_deposits hbd
        JOIN hundi h ON h.id = hbd.hundi_id
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        JOIN temples t ON t.id = hbd.temple_id
        JOIN users u ON u.id = hbd.deposited_by
        LEFT JOIN (${CASH_SUBQUERY}) cash ON cash.hundi_id = hbd.hundi_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY hbd.created_at DESC
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

export const searchDepositedByForTemple = async (
  templeId: number,
  query: string,
): Promise<DepositedByOption[]> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & DepositedByOption)[]>(
      `
        SELECT id, user_name AS name, user_phone AS phone
        FROM users
        WHERE temple_id = ?
          AND deleted_at IS NULL
          AND user_status = 'active'
          AND user_name LIKE ?
        ORDER BY user_name ASC
        LIMIT 10
      `,
      [templeId, `%${query}%`],
    )

    return rows
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const findDepositedByUser = async (
  userId: number,
  templeId: number,
): Promise<{ id: number } | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `
        SELECT id
        FROM users
        WHERE id = ? AND temple_id = ? AND deleted_at IS NULL AND user_status = 'active'
        LIMIT 1
      `,
      [userId, templeId],
    )

    return rows[0] ? { id: rows[0].id as number } : null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const insertHundiBankDeposit = async (data: CreateHundiBankDepositData): Promise<number> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [result] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO hundi_bank_deposits (
          organization_id,
          temple_id,
          deity_id,
          hundi_id,
          bank_name,
          account_holder_name,
          account_number,
          ifsc_code,
          transaction_number,
          deposit_date,
          deposit_amount,
          remarks,
          deposited_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.organization_id,
        data.temple_id,
        data.deity_id,
        data.hundi_id,
        data.bank_name,
        data.account_holder_name,
        data.account_number,
        data.ifsc_code,
        data.transaction_number,
        data.deposit_date,
        data.deposit_amount,
        data.remarks,
        data.deposited_by,
      ],
    )

    return result.insertId
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const findDepositByTransactionNumber = async (
  transactionNumber: string,
  excludeId: number,
): Promise<{ id: number } | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM hundi_bank_deposits WHERE transaction_number = ? AND id != ? LIMIT 1`,
      [transactionNumber, excludeId],
    )

    return rows[0] ? { id: rows[0].id as number } : null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const getHundiBankDepositById = async (id: number): Promise<HundiBankDepositDetail | null> => {
  let conn

  try {
    conn = await pool.getConnection()

    const [rows] = await conn.execute<(RowDataPacket & HundiBankDepositDetail)[]>(
      `
        SELECT
          hbd.id,
          hbd.organization_id,
          hbd.temple_id,
          hbd.deity_id,
          hbd.hundi_id,
          dh.hundi_number,
          dh.hundi_name,
          t.temp_name,
          hbd.bank_name,
          hbd.account_holder_name,
          hbd.account_number,
          hbd.ifsc_code,
          hbd.transaction_number,
          hbd.deposit_date,
          hbd.deposit_amount,
          hbd.remarks,
          hbd.deposited_by,
          u.user_name AS deposited_by_name,
          u.user_phone AS deposited_by_phone,
          COALESCE(cash.total_cash, 0) AS total_cash,
          COALESCE(cash.total_cash, 0) - COALESCE(other_deposits.other_deposited_amount, 0) AS remaining_amount
        FROM hundi_bank_deposits hbd
        JOIN hundi h ON h.id = hbd.hundi_id
        JOIN define_hundi dh ON dh.id = h.define_hundi_id
        JOIN temples t ON t.id = hbd.temple_id
        JOIN users u ON u.id = hbd.deposited_by
        LEFT JOIN (${CASH_SUBQUERY}) cash ON cash.hundi_id = hbd.hundi_id
        LEFT JOIN (
          SELECT hundi_id, SUM(deposit_amount) AS other_deposited_amount
          FROM hundi_bank_deposits
          WHERE id != ?
          GROUP BY hundi_id
        ) other_deposits ON other_deposits.hundi_id = hbd.hundi_id
        WHERE hbd.id = ?
        LIMIT 1
      `,
      [id, id],
    )

    return rows[0] ?? null
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const updateHundiBankDeposit = async (id: number, data: UpdateHundiBankDepositData): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(
      `
        UPDATE hundi_bank_deposits
        SET
          bank_name = ?,
          account_holder_name = ?,
          account_number = ?,
          ifsc_code = ?,
          transaction_number = ?,
          deposit_date = ?,
          deposit_amount = ?,
          remarks = ?,
          deposited_by = ?
        WHERE id = ?
      `,
      [
        data.bank_name,
        data.account_holder_name,
        data.account_number,
        data.ifsc_code,
        data.transaction_number,
        data.deposit_date,
        data.deposit_amount,
        data.remarks,
        data.deposited_by,
        id,
      ],
    )
  } finally {
    if (conn) {
      conn.release()
    }
  }
}

export const deleteHundiBankDepositById = async (id: number): Promise<void> => {
  let conn

  try {
    conn = await pool.getConnection()

    await conn.execute<ResultSetHeader>(`DELETE FROM hundi_bank_deposits WHERE id = ?`, [id])
  } finally {
    if (conn) {
      conn.release()
    }
  }
}
