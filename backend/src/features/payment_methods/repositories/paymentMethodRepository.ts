


import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";

import type {
  CreatePaymentMethodInput,
  PaymentMethod,
  UpdatePaymentMethodInput,
} from "../paymentMethodTypes";

interface PaymentMethodRow extends RowDataPacket {
  id: number;
  organization_id: number;
  temple_id: number;
  temple_name: string | null;
  payment_method: string;
  payment_method_type: "online" | "offline";
  remark: string | null;
  is_default: "yes" | "no";
  display_order: number;
  status: "active" | "inactive";
  created_at: Date;
  updated_at: Date;
}

/**
 * Shared SELECT query.
 * Includes the temple name for displaying in the frontend.
 */
const paymentMethodSelect = `
  SELECT
    pm.id,
    pm.organization_id,
    pm.temple_id,
    t.temp_name AS temple_name,
    pm.payment_method,
    pm.payment_method_type,
    pm.remark,
    pm.is_default,
    pm.display_order,
    pm.status,
    pm.created_at,
    pm.updated_at
  FROM payment_methods pm
  LEFT JOIN temples t
    ON t.id = pm.temple_id
   AND t.organization_id = pm.organization_id
`;

/**
 * Convert a database row into the PaymentMethod type.
 */
const mapPaymentMethod = (
  row: PaymentMethodRow
): PaymentMethod => ({
  id: row.id,
  organization_id: row.organization_id,
  temple_id: row.temple_id,
  temple_name: row.temple_name,
  payment_method: row.payment_method,
  payment_method_type: row.payment_method_type,
  remark: row.remark,
  is_default: row.is_default,
  display_order: row.display_order,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Create a payment method.
 * Only one default payment method is allowed per temple.
 */
export const createPaymentMethodRepository = async (
  data: CreatePaymentMethodInput
): Promise<PaymentMethod> => {
  const connection: PoolConnection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (data.is_default === "yes") {
      await connection.execute(
        `
          UPDATE payment_methods
          SET
            is_default = 'no',
            updated_at = CURRENT_TIMESTAMP
          WHERE organization_id = ?
            AND temple_id = ?
            AND is_default = 'yes'
        `,
        [data.organization_id, data.temple_id]
      );
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO payment_methods (
          organization_id,
          temple_id,
          payment_method,
          payment_method_type,
          remark,
          is_default,
          display_order,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.organization_id,
        data.temple_id,
        data.payment_method,
        data.payment_method_type,
        data.remark ?? null,
        data.is_default ?? "no",
        data.display_order ?? 0,
        data.status ?? "active",
      ]
    );

    const [rows] = await connection.execute<PaymentMethodRow[]>(
      `
        ${paymentMethodSelect}
        WHERE pm.id = ?
          AND pm.organization_id = ?
        LIMIT 1
      `,
      [result.insertId, data.organization_id]
    );

    if (rows.length === 0) {
      throw new Error("Failed to create payment method");
    }

    await connection.commit();

    return mapPaymentMethod(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get all payment methods belonging to an organization.
 */
export const getPaymentMethodsRepository = async (
  organizationId: number
): Promise<PaymentMethod[]> => {
  const [rows] = await pool.execute<PaymentMethodRow[]>(
    `
      ${paymentMethodSelect}
      WHERE pm.organization_id = ?
      ORDER BY pm.display_order ASC, pm.id DESC
    `,
    [organizationId]
  );

  return rows.map(mapPaymentMethod);
};

/**
 * Get one payment method by ID within an organization.
 */
export const getPaymentMethodByIdRepository = async (
  id: number,
  organizationId: number
): Promise<PaymentMethod | null> => {
  const [rows] = await pool.execute<PaymentMethodRow[]>(
    `
      ${paymentMethodSelect}
      WHERE pm.id = ?
        AND pm.organization_id = ?
      LIMIT 1
    `,
    [id, organizationId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapPaymentMethod(rows[0]);
};

/**
 * Update a payment method.
 */
export const updatePaymentMethodRepository = async (
  id: number,
  organizationId: number,
  data: UpdatePaymentMethodInput
): Promise<PaymentMethod | null> => {
  const connection: PoolConnection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute<PaymentMethodRow[]>(
      `
        ${paymentMethodSelect}
        WHERE pm.id = ?
          AND pm.organization_id = ?
        LIMIT 1
      `,
      [id, organizationId]
    );

    if (existingRows.length === 0) {
      await connection.rollback();
      return null;
    }

    const existing = existingRows[0];

    const templeId = data.temple_id ?? existing.temple_id;
    const isDefault = data.is_default ?? existing.is_default;
    const paymentMethod =
      data.payment_method ?? existing.payment_method;

    /*
     * Check for duplicate payment methods when the temple or
     * payment method name changes.
     */
    if (
      (data.temple_id !== undefined &&
        data.temple_id !== existing.temple_id) ||
      (data.payment_method !== undefined &&
        data.payment_method !== existing.payment_method)
    ) {
      const [duplicateRows] = await connection.execute<RowDataPacket[]>(
        `
          SELECT id
          FROM payment_methods
          WHERE organization_id = ?
            AND temple_id = ?
            AND payment_method = ?
            AND id <> ?
          LIMIT 1
        `,
        [organizationId, templeId, paymentMethod, id]
      );

      if (duplicateRows.length > 0) {
        const duplicateError = new Error(
          "Payment method already exists for this temple."
        ) as Error & { code?: string };

        duplicateError.code = "ER_DUP_ENTRY";
        throw duplicateError;
      }
    }

    /*
     * If this payment method becomes the default,
     * unset the default on other methods in the same temple.
     */
    if (isDefault === "yes") {
      await connection.execute(
        `
          UPDATE payment_methods
          SET
            is_default = 'no',
            updated_at = CURRENT_TIMESTAMP
          WHERE organization_id = ?
            AND temple_id = ?
            AND is_default = 'yes'
            AND id <> ?
        `,
        [organizationId, templeId, id]
      );
    }

    const fields: string[] = [];
    const values: Array<
      string | number | boolean | null | Date | Buffer
    > = [];

    if (data.temple_id !== undefined) {
      fields.push("temple_id = ?");
      values.push(data.temple_id);
    }

    if (data.payment_method !== undefined) {
      fields.push("payment_method = ?");
      values.push(data.payment_method);
    }

    if (data.payment_method_type !== undefined) {
      fields.push("payment_method_type = ?");
      values.push(data.payment_method_type);
    }

    if (data.remark !== undefined) {
      fields.push("remark = ?");
      values.push(data.remark);
    }

    if (data.is_default !== undefined) {
      fields.push("is_default = ?");
      values.push(data.is_default);
    }

    if (data.display_order !== undefined) {
      fields.push("display_order = ?");
      values.push(data.display_order);
    }

    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    /*
     * No fields to update: return the existing record.
     */
    if (fields.length === 0) {
      await connection.commit();
      return mapPaymentMethod(existing);
    }

    values.push(id, organizationId);

    await connection.execute(
      `
        UPDATE payment_methods
        SET
          ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND organization_id = ?
      `,
      values
    );

    const [updatedRows] = await connection.execute<PaymentMethodRow[]>(
      `
        ${paymentMethodSelect}
        WHERE pm.id = ?
          AND pm.organization_id = ?
        LIMIT 1
      `,
      [id, organizationId]
    );

    await connection.commit();

    if (updatedRows.length === 0) {
      return null;
    }

    return mapPaymentMethod(updatedRows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Delete a payment method within an organization.
 */
export const deletePaymentMethodRepository = async (
  id: number,
  organizationId: number
): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      DELETE FROM payment_methods
      WHERE id = ?
        AND organization_id = ?
    `,
    [id, organizationId]
  );

  return result.affectedRows > 0;
};