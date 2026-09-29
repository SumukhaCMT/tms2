// import  pool  from "../../../config/database"
// // import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"
// import type {
//   CreateSubscriptionPlanPayload,
//   SubscriptionPlan,
//   UpdateSubscriptionPlanPayload,
// } from "../subscriptionPlanTypes";

// export const createSubscriptionPlan = async (
//   data: CreateSubscriptionPlanPayload,
// ): Promise<SubscriptionPlan> => {
//   const [result] = await pool.execute(
//     `
//       INSERT INTO subscription_plans (
//         module_id,
//         plan_name,
//         plan_code,
//         plan_type,
//         plan_quantity,
//         plan_duration_months,
//         plan_price,
//         plan_gst_percentage,
//         plan_total_price,
//         plan_amc_price,
//         plan_amc_duration_months,
//         plan_amc_gst_percentage,
//         plan_amc_start_date,
//         plan_status
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `,
//     [
//       data.module_id ?? null,
//       data.plan_name,
//       data.plan_code,
//       data.plan_type,
//       data.plan_quantity,
//       data.plan_duration_months,
//       data.plan_price,
//       data.plan_gst_percentage,
//       data.plan_total_price ?? 0,
//       data.plan_amc_price,
//       data.plan_amc_duration_months,
//       data.plan_amc_gst_percentage,
//       data.plan_amc_start_date ?? null,
//       data.plan_status ?? "active",
//     ],
//   );

//   const insertResult = result as { insertId: number };

//   const plan = await findSubscriptionPlanById(insertResult.insertId);

//   if (!plan) {
//     throw new Error("Subscription plan could not be created");
//   }

//   return plan;
// };

// export const findAllSubscriptionPlans = async (): Promise<
//   SubscriptionPlan[]
// > => {
//   const [rows] = await pool.execute(
//     `
//       SELECT *
//       FROM subscription_plans
//       ORDER BY id DESC
//     `,
//   );

//   return rows as SubscriptionPlan[];
// };

// export const findSubscriptionPlanById = async (
//   id: number,
// ): Promise<SubscriptionPlan | null> => {
//   const [rows] = await pool.execute(
//     `
//       SELECT *
//       FROM subscription_plans
//       WHERE id = ?
//       LIMIT 1
//     `,
//     [id],
//   );

//   const plans = rows as SubscriptionPlan[];

//   return plans.length > 0 ? plans[0] : null;
// };

// export const findSubscriptionPlanByCode = async (
//   planCode: string,
// ): Promise<SubscriptionPlan | null> => {
//   const [rows] = await pool.execute(
//     `
//       SELECT *
//       FROM subscription_plans
//       WHERE plan_code = ?
//       LIMIT 1
//     `,
//     [planCode],
//   );

//   const plans = rows as SubscriptionPlan[];

//   return plans.length > 0 ? plans[0] : null;
// };

// // export const updateSubscriptionPlan = async (
// //   id: number,
// //   data: UpdateSubscriptionPlanPayload,
// // ): Promise<SubscriptionPlan | null> => {
// //   const fields: string[] = [];
// //   const values: unknown[] = [];

// //   if (data.module_id !== undefined) {
// //     fields.push("module_id = ?");
// //     values.push(data.module_id);
// //   }

// //   if (data.plan_name !== undefined) {
// //     fields.push("plan_name = ?");
// //     values.push(data.plan_name);
// //   }

// //   if (data.plan_code !== undefined) {
// //     fields.push("plan_code = ?");
// //     values.push(data.plan_code);
// //   }

// //   if (data.plan_type !== undefined) {
// //     fields.push("plan_type = ?");
// //     values.push(data.plan_type);
// //   }

// //   if (data.plan_quantity !== undefined) {
// //     fields.push("plan_quantity = ?");
// //     values.push(data.plan_quantity);
// //   }

// //   if (data.plan_duration_months !== undefined) {
// //     fields.push("plan_duration_months = ?");
// //     values.push(data.plan_duration_months);
// //   }

// //   if (data.plan_price !== undefined) {
// //     fields.push("plan_price = ?");
// //     values.push(data.plan_price);
// //   }

// //   if (data.plan_gst_percentage !== undefined) {
// //     fields.push("plan_gst_percentage = ?");
// //     values.push(data.plan_gst_percentage);
// //   }

// //   if (data.plan_total_price !== undefined) {
// //     fields.push("plan_total_price = ?");
// //     values.push(data.plan_total_price);
// //   }

// //   if (data.plan_amc_price !== undefined) {
// //     fields.push("plan_amc_price = ?");
// //     values.push(data.plan_amc_price);
// //   }

// //   if (data.plan_amc_duration_months !== undefined) {
// //     fields.push("plan_amc_duration_months = ?");
// //     values.push(data.plan_amc_duration_months);
// //   }

// //   if (data.plan_amc_gst_percentage !== undefined) {
// //     fields.push("plan_amc_gst_percentage = ?");
// //     values.push(data.plan_amc_gst_percentage);
// //   }

// //   if (data.plan_amc_start_date !== undefined) {
// //     fields.push("plan_amc_start_date = ?");
// //     values.push(data.plan_amc_start_date);
// //   }

// //   if (data.plan_status !== undefined) {
// //     fields.push("plan_status = ?");
// //     values.push(data.plan_status);
// //   }

// //   if (fields.length === 0) {
// //     return findSubscriptionPlanById(id);
// //   }

// //   fields.push("updated_at = CURRENT_TIMESTAMP");

// //   values.push(id);

// //   await pool.execute(
// //     `
// //       UPDATE subscription_plans
// //       SET ${fields.join(", ")}
// //       WHERE id = ?
// //     `,
// //     values,
// //   );

// //   return findSubscriptionPlanById(id);
// // };


// export const updateSubscriptionPlan = async (
//   id: number,
//   data: UpdateSubscriptionPlanPayload,
// ): Promise<SubscriptionPlan | null> => {
//   const fields: string[] = [];
//   const values: unknown[] = [];

//   /*
//    * Get current plan first.
//    * This helps us know the existing plan_type when
//    * plan_type is not included in the update request.
//    */
//   const currentPlan = await findSubscriptionPlanById(id);

//   if (!currentPlan) {
//     return null;
//   }

//   /*
//    * Determine the final plan type after update.
//    */
//   const finalPlanType = data.plan_type ?? currentPlan.plan_type;

//   /*
//    * --------------------------------------------------
//    * BASIC PLAN FIELDS
//    * --------------------------------------------------
//    */

//   if (data.module_id !== undefined) {
//     fields.push("module_id = ?");
//     values.push(data.module_id);
//   }

//   if (data.plan_name !== undefined) {
//     fields.push("plan_name = ?");
//     values.push(data.plan_name);
//   }

//   if (data.plan_code !== undefined) {
//     fields.push("plan_code = ?");
//     values.push(data.plan_code);
//   }

//   if (data.plan_type !== undefined) {
//     fields.push("plan_type = ?");
//     values.push(data.plan_type);
//   }

//   if (data.plan_quantity !== undefined) {
//     fields.push("plan_quantity = ?");
//     values.push(data.plan_quantity);
//   }

//   /*
//    * --------------------------------------------------
//    * SUBSCRIPTION DURATION
//    * --------------------------------------------------
//    *
//    * Only subscription plans should have duration.
//    * Perpetual plans will automatically clear it.
//    */

//   if (finalPlanType === "subscription") {
//     if (data.plan_duration_months !== undefined) {
//       fields.push("plan_duration_months = ?");
//       values.push(data.plan_duration_months);
//     }
//   } else {
//     fields.push("plan_duration_months = NULL");
    
//   }

//   /*
//    * --------------------------------------------------
//    * PRICE
//    * --------------------------------------------------
//    */

//   if (data.plan_price !== undefined) {
//     fields.push("plan_price = ?");
//     values.push(data.plan_price);
//   }

//   if (data.plan_gst_percentage !== undefined) {
//     fields.push("plan_gst_percentage = ?");
//     values.push(data.plan_gst_percentage);
//   }

//   if (data.plan_total_price !== undefined) {
//     fields.push("plan_total_price = ?");
//     values.push(data.plan_total_price);
//   }

//   /*
//    * --------------------------------------------------
//    * AMC FIELDS
//    * --------------------------------------------------
//    *
//    * Only perpetual plans should keep AMC information.
//    * Subscription plans automatically clear all AMC data.
//    */

//   if (finalPlanType === "perpetual") {
//     if (data.plan_amc_price !== undefined) {
//       fields.push("plan_amc_price = ?");
//       values.push(data.plan_amc_price);
//     }

//     if (data.plan_amc_duration_months !== undefined) {
//       fields.push("plan_amc_duration_months = ?");
//       values.push(data.plan_amc_duration_months);
//     }

//     if (data.plan_amc_gst_percentage !== undefined) {
//       fields.push("plan_amc_gst_percentage = ?");
//       values.push(data.plan_amc_gst_percentage);
//     }

//     if (data.plan_amc_start_date !== undefined) {
//       fields.push("plan_amc_start_date = ?");
//       values.push(data.plan_amc_start_date);
//     }
//   } else {
//     fields.push("plan_amc_price = NULL");
//     fields.push("plan_amc_duration_months = NULL");
//     fields.push("plan_amc_gst_percentage = 0");
//     fields.push("plan_amc_start_date = NULL");
//   }

//   /*
//    * --------------------------------------------------
//    * STATUS
//    * --------------------------------------------------
//    */

//   if (data.plan_status !== undefined) {
//     fields.push("plan_status = ?");
//     values.push(data.plan_status);
//   }

//   /*
//    * --------------------------------------------------
//    * NOTHING TO UPDATE
//    * --------------------------------------------------
//    */

//   if (fields.length === 0) {
//     return currentPlan;
//   }

//   /*
//    * Always update timestamp.
//    */
//   fields.push("updated_at = CURRENT_TIMESTAMP");

//   values.push(id);

//   await pool.execute(
//     `
//       UPDATE subscription_plans
//       SET ${fields.join(", ")}
//       WHERE id = ?
//     `,
//     values,
//   );

//   return findSubscriptionPlanById(id);
// };
// export const deleteSubscriptionPlan = async (
//   id: number,
// ): Promise<boolean> => {
//   const [result] = await pool.execute(
//     `
//       DELETE FROM subscription_plans
//       WHERE id = ?
//     `,
//     [id],
//   );

//   const deleteResult = result as { affectedRows: number };

//   return deleteResult.affectedRows > 0;
// };


import pool from "../../../config/database"

import type {
  CreateSubscriptionPlanPayload,
  SubscriptionPlan,
  UpdateSubscriptionPlanPayload,
} from "../subscriptionPlanTypes"

/*
 * ================================================================
 * MYSQL QUERY VALUE
 * ================================================================
 */

type QueryValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer

/*
 * ================================================================
 * CREATE SUBSCRIPTION PLAN
 * ================================================================
 */

export const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanPayload,
): Promise<SubscriptionPlan> => {
  const [result] = await pool.execute(
    `
      INSERT INTO subscription_plans (
        module_id,
        plan_name,
        plan_code,
        plan_type,
        plan_quantity,
        plan_duration_months,
        plan_price,
        plan_gst_percentage,
        plan_total_price,
        plan_amc_price,
        plan_amc_duration_months,
        plan_amc_gst_percentage,
        plan_amc_start_date,
        plan_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.module_id ?? null,
      data.plan_name,
      data.plan_code,
      data.plan_type,
      data.plan_quantity ?? null,
      data.plan_duration_months ?? null,
      data.plan_price,
      data.plan_gst_percentage,
      data.plan_total_price ?? 0,
      data.plan_amc_price ?? null,
      data.plan_amc_duration_months ?? null,
      data.plan_amc_gst_percentage ?? 0,
      data.plan_amc_start_date ?? null,
      data.plan_status ?? "active",
    ],
  )

  const insertResult = result as {
    insertId: number
  }

  const plan =
    await findSubscriptionPlanById(
      insertResult.insertId,
    )

  if (!plan) {
    throw new Error(
      "Subscription plan could not be created",
    )
  }

  return plan
}

/*
 * ================================================================
 * FIND ALL
 * ================================================================
 */

export const findAllSubscriptionPlans =
  async (): Promise<SubscriptionPlan[]> => {
    const [rows] = await pool.execute(
      `
        SELECT *
        FROM subscription_plans
        ORDER BY id DESC
      `,
    )

    return rows as SubscriptionPlan[]
  }

/*
 * ================================================================
 * FIND BY ID
 * ================================================================
 */

export const findSubscriptionPlanById = async (
  id: number,
): Promise<SubscriptionPlan | null> => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  )

  const plans = rows as SubscriptionPlan[]

  return plans.length > 0
    ? plans[0]
    : null
}

/*
 * ================================================================
 * FIND BY CODE
 * ================================================================
 */

export const findSubscriptionPlanByCode =
  async (
    planCode: string,
  ): Promise<SubscriptionPlan | null> => {
    const [rows] = await pool.execute(
      `
        SELECT *
        FROM subscription_plans
        WHERE plan_code = ?
        LIMIT 1
      `,
      [planCode],
    )

    const plans = rows as SubscriptionPlan[]

    return plans.length > 0
      ? plans[0]
      : null
  }

/*
 * ================================================================
 * UPDATE
 * ================================================================
 */

export const updateSubscriptionPlan = async (
  id: number,
  data: UpdateSubscriptionPlanPayload,
): Promise<SubscriptionPlan | null> => {
  const fields: string[] = []

  /*
   * IMPORTANT:
   * Do not use unknown[] here.
   */
  const values: QueryValue[] = []

  /*
   * Get existing plan.
   */
  const currentPlan =
    await findSubscriptionPlanById(id)

  if (!currentPlan) {
    return null
  }

  /*
   * Determine final plan type.
   */
  const finalPlanType =
    data.plan_type ?? currentPlan.plan_type

  /*
   * --------------------------------------------------
   * BASIC FIELDS
   * --------------------------------------------------
   */

  if (data.module_id !== undefined) {
    fields.push("module_id = ?")
    values.push(data.module_id)
  }

  if (data.plan_name !== undefined) {
    fields.push("plan_name = ?")
    values.push(data.plan_name)
  }

  if (data.plan_code !== undefined) {
    fields.push("plan_code = ?")
    values.push(data.plan_code)
  }

  if (data.plan_type !== undefined) {
    fields.push("plan_type = ?")
    values.push(data.plan_type)
  }

  if (data.plan_quantity !== undefined) {
    fields.push("plan_quantity = ?")
    values.push(data.plan_quantity)
  }

  /*
   * --------------------------------------------------
   * DURATION
   * --------------------------------------------------
   */

  if (finalPlanType === "subscription") {
    if (
      data.plan_duration_months !==
      undefined
    ) {
      fields.push(
        "plan_duration_months = ?",
      )

      values.push(
        data.plan_duration_months,
      )
    }
  } else {
    fields.push(
      "plan_duration_months = NULL",
    )
  }

  /*
   * --------------------------------------------------
   * PRICE
   * --------------------------------------------------
   */

  if (data.plan_price !== undefined) {
    fields.push("plan_price = ?")
    values.push(data.plan_price)
  }

  if (
    data.plan_gst_percentage !==
    undefined
  ) {
    fields.push(
      "plan_gst_percentage = ?",
    )

    values.push(
      data.plan_gst_percentage,
    )
  }

  if (
    data.plan_total_price !==
    undefined
  ) {
    fields.push(
      "plan_total_price = ?",
    )

    values.push(
      data.plan_total_price,
    )
  }

  /*
   * --------------------------------------------------
   * AMC
   * --------------------------------------------------
   */

  if (finalPlanType === "perpetual") {
    if (
      data.plan_amc_price !==
      undefined
    ) {
      fields.push(
        "plan_amc_price = ?",
      )

      values.push(
        data.plan_amc_price,
      )
    }

    if (
      data.plan_amc_duration_months !==
      undefined
    ) {
      fields.push(
        "plan_amc_duration_months = ?",
      )

      values.push(
        data.plan_amc_duration_months,
      )
    }

    if (
      data.plan_amc_gst_percentage !==
      undefined
    ) {
      fields.push(
        "plan_amc_gst_percentage = ?",
      )

      values.push(
        data.plan_amc_gst_percentage,
      )
    }

    if (
      data.plan_amc_start_date !==
      undefined
    ) {
      fields.push(
        "plan_amc_start_date = ?",
      )

      values.push(
        data.plan_amc_start_date,
      )
    }
  } else {
    /*
     * Subscription plans do not use AMC.
     */

    fields.push(
      "plan_amc_price = NULL",
    )

    fields.push(
      "plan_amc_duration_months = NULL",
    )

    fields.push(
      "plan_amc_gst_percentage = 0",
    )

    fields.push(
      "plan_amc_start_date = NULL",
    )
  }

  /*
   * --------------------------------------------------
   * STATUS
   * --------------------------------------------------
   */

  if (data.plan_status !== undefined) {
    fields.push("plan_status = ?")
    values.push(data.plan_status)
  }

  /*
   * --------------------------------------------------
   * NOTHING TO UPDATE
   * --------------------------------------------------
   */

  if (fields.length === 0) {
    return currentPlan
  }

  fields.push(
    "updated_at = CURRENT_TIMESTAMP",
  )

  values.push(id)

  await pool.execute(
    `
      UPDATE subscription_plans
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values,
  )

  return findSubscriptionPlanById(id)
}

/*
 * ================================================================
 * DELETE
 * ================================================================
 */

export const deleteSubscriptionPlan = async (
  id: number,
): Promise<boolean> => {
  const [result] = await pool.execute(
    `
      DELETE FROM subscription_plans
      WHERE id = ?
    `,
    [id],
  )

  const deleteResult = result as {
    affectedRows: number
  }

  return deleteResult.affectedRows > 0
}