import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import db from "../../../config/database";

import type {
  CreateSubscriptionBundlePayload,
  SubscriptionBundle,
  SubscriptionBundleWithPlans,
  UpdateSubscriptionBundlePayload
} from "../subscriptionBundleTypes";

interface CountRow extends RowDataPacket {
  count: number;
}

export class SubscriptionBundleRepository {
  async isNameExists(
    bundleName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const [rows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS count
      FROM subscription_bundles
      WHERE bundle_name = ?
        AND id != ?
      `,
      [bundleName, excludeId ?? 0],
    );

    return rows[0].count > 0;
  }

  async isCodeExists(
    bundleCode: string,
    excludeId?: number,
  ): Promise<boolean> {
    const [rows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS count
      FROM subscription_bundles
      WHERE bundle_code = ?
        AND id != ?
      `,
      [bundleCode, excludeId ?? 0],
    );

    return rows[0].count > 0;
  }

  async create(
    payload: CreateSubscriptionBundlePayload,
  ): Promise<number> {
    const connection: PoolConnection =
      await db.getConnection();

    try {
      await connection.beginTransaction();

      const [bundleResult] =
        await connection.execute<ResultSetHeader>(
          `
          INSERT INTO subscription_bundles (
            bundle_name,
            bundle_code,
            bundle_type,
            bundle_duration_months,
            bundle_price,
            bundle_gst_percentage,
            bundle_total_price,
            bundle_amc_price,
            bundle_amc_duration_months,
            bundle_amc_gst_percentage,
            bundle_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            payload.bundle_name,
            payload.bundle_code,
            payload.bundle_type,
            payload.bundle_type === "subscription"
              ? payload.bundle_duration_months ?? null
              : null,
            payload.bundle_price,
            payload.bundle_gst_percentage ?? 0,
            payload.bundle_total_price,
            payload.bundle_type === "perpetual"
              ? payload.bundle_amc_price ?? null
              : null,
            payload.bundle_type === "perpetual"
              ? payload.bundle_amc_duration_months ?? null
              : null,
            payload.bundle_type === "perpetual"
              ? payload.bundle_amc_gst_percentage ?? 0
              : null,
            payload.bundle_status ?? "active",
          ],
        );

      const bundleId = bundleResult.insertId;

      for (const planId of payload.plan_ids) {
        await connection.execute(
          `
          INSERT INTO subscription_bundle_items (
            bundle_id,
            plan_id
          )
          VALUES (?, ?)
          `,
          [bundleId, planId],
        );
      }

      await connection.commit();

      return bundleId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findAll(): Promise<SubscriptionBundleWithPlans[]> {
    const [rows] = await db.query<
      (SubscriptionBundle & RowDataPacket)[]
    >(
      `
      SELECT
        sb.*,
        COALESCE(
          JSON_ARRAYAGG(sbi.plan_id),
          JSON_ARRAY()
        ) AS plan_ids
      FROM subscription_bundles sb
      LEFT JOIN subscription_bundle_items sbi
        ON sbi.bundle_id = sb.id
      GROUP BY sb.id
      ORDER BY sb.id DESC
      `,
    );

    return rows as SubscriptionBundleWithPlans[];
  }

  async findById(
    id: number,
  ): Promise<SubscriptionBundleWithPlans | null> {
    const [rows] = await db.query<
      (SubscriptionBundle & RowDataPacket)[]
    >(
      `
      SELECT
        sb.*,
        COALESCE(
          JSON_ARRAYAGG(sbi.plan_id),
          JSON_ARRAY()
        ) AS plan_ids
      FROM subscription_bundles sb
      LEFT JOIN subscription_bundle_items sbi
        ON sbi.bundle_id = sb.id
      WHERE sb.id = ?
      GROUP BY sb.id
      `,
      [id],
    );

    return rows[0]
      ? (rows[0] as SubscriptionBundleWithPlans)
      : null;
  }
 async update(
    id: number,
    payload: UpdateSubscriptionBundlePayload,
  ): Promise<void> {
    const connection =
      await db.getConnection()

    try {
      await connection.beginTransaction()

      const bundleType =
        payload.bundle_type

      const updateFields: string[] = []
      const updateValues: unknown[] = []

      if (
        payload.bundle_name !== undefined
      ) {
        updateFields.push(
          "bundle_name = ?",
        )
        updateValues.push(
          payload.bundle_name,
        )
      }

      if (
        payload.bundle_code !== undefined
      ) {
        updateFields.push(
          "bundle_code = ?",
        )
        updateValues.push(
          payload.bundle_code,
        )
      }

      if (
        payload.bundle_type !== undefined
      ) {
        updateFields.push(
          "bundle_type = ?",
        )
        updateValues.push(
          payload.bundle_type,
        )
      }

      if (
        payload.bundle_duration_months !==
        undefined
      ) {
        updateFields.push(
          "bundle_duration_months = ?",
        )

        updateValues.push(
          bundleType === "perpetual"
            ? null
            : payload.bundle_duration_months,
        )
      }

      if (
        payload.bundle_price !== undefined
      ) {
        updateFields.push(
          "bundle_price = ?",
        )
        updateValues.push(
          payload.bundle_price,
        )
      }

      if (
        payload.bundle_gst_percentage !==
        undefined
      ) {
        updateFields.push(
          "bundle_gst_percentage = ?",
        )
        updateValues.push(
          payload.bundle_gst_percentage,
        )
      }

      if (
        payload.bundle_total_price !==
        undefined
      ) {
        updateFields.push(
          "bundle_total_price = ?",
        )
        updateValues.push(
          payload.bundle_total_price,
        )
      }

      if (
        payload.bundle_amc_price !==
        undefined
      ) {
        updateFields.push(
          "bundle_amc_price = ?",
        )

        updateValues.push(
          bundleType === "subscription"
            ? null
            : payload.bundle_amc_price,
        )
      }

      if (
        payload.bundle_amc_duration_months !==
        undefined
      ) {
        updateFields.push(
          "bundle_amc_duration_months = ?",
        )

        updateValues.push(
          bundleType === "subscription"
            ? null
            : payload.bundle_amc_duration_months,
        )
      }

      if (
        payload.bundle_amc_gst_percentage !==
        undefined
      ) {
        updateFields.push(
          "bundle_amc_gst_percentage = ?",
        )

        updateValues.push(
          bundleType === "subscription"
            ? null
            : payload.bundle_amc_gst_percentage,
        )
      }

      if (
        payload.bundle_status !== undefined
      ) {
        updateFields.push(
          "bundle_status = ?",
        )
        updateValues.push(
          payload.bundle_status,
        )
      }

      // if (updateFields.length > 0) {
      //   await connection.execute(
      //     `
      //     UPDATE subscription_bundles
      //     SET ${updateFields.join(", ")}
      //     WHERE id = ?
      //     `,
      //     [
      //       ...updateValues,
      //       id,
      //     ],
      //   )
      // }
if (updateFields.length > 0) {
  await connection.query(
    `
    UPDATE subscription_bundles
    SET ${updateFields.join(", ")}
    WHERE id = ?
    `,
    [
      ...updateValues,
      id,
    ],
  )
}
      if (
        payload.plan_ids !== undefined
      ) {
        await connection.execute(
          `
          DELETE FROM subscription_bundle_items
          WHERE bundle_id = ?
          `,
          [id],
        )

        for (const planId of payload.plan_ids) {
          await connection.execute(
            `
            INSERT INTO subscription_bundle_items (
              bundle_id,
              plan_id
            )
            VALUES (?, ?)
            `,
            [
              id,
              planId,
            ],
          )
        }
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
  async delete(id: number): Promise<void> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `
        DELETE FROM subscription_bundle_items
        WHERE bundle_id = ?
        `,
        [id],
      );

      await connection.execute(
        `
        DELETE FROM subscription_bundles
        WHERE id = ?
        `,
        [id],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new SubscriptionBundleRepository();