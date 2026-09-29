

import db from "../../../config/database"

import {
  organizationRepository,
} from "../repositories/organizationRepository"

import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "../organizationTypes"
import argon2 from "argon2"

import {
  userRepository,
} from "../repositories/userRepository"
import {
  orderRepository,
} from "../repositories/orderRepository"

import {
  orderItemRepository,
} from "../repositories/orderItemRepository"
import { orgSubscriptionRepository } from "../repositories/orgsubscriptionRepository"
import { defaultRepository } from "../repositories/defaultRepository"
import type {
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise"

import {
  templeRepository,
} from "../repositories/templeRepository"



// ============================================================
// SLUGIFY
// ============================================================

function slugify(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "")
}

// ============================================================
// GENERATE UNIQUE SLUG
// ============================================================

async function generateUniqueSlug(
  conn: PoolConnection,
  name: string,
  excludeId?: number,
) {
  const baseSlug =
    slugify(name) ||
    "organization"

  let slug = baseSlug
  let counter = 1

  while (
    await organizationRepository.findSlug(
      conn,
      slug,
      excludeId,
    )
  ) {
    counter++

    slug =
      `${baseSlug}-${counter}`
  }

  return slug
}
// ============================================================
// ORGANIZATION SERVICE
// ============================================================

export const organizationService = {

  // ============================================================
  // GET ALL ORGANIZATIONS
  // ============================================================

  async getAll() {
    const conn =
      await db.getConnection()

    try {
      return await organizationRepository.findAll(
        conn,
      )
    } finally {
      conn.release()
    }
  },

  // ============================================================
  // GET ORGANIZATION BY ID
  // ============================================================

  // async getById(
  //   id: number,
  // ) {
  //   const conn =
  //     await db.getConnection()

  //   try {
  //     return await organizationRepository.findById(
  //       conn,
  //       id,
  //     )
  //   } finally {
  //     conn.release()
  //   }
  // },

   async findById(
    conn: PoolConnection,
    id: number,
  ) {
    const organization =
      await organizationRepository.findById(
        conn,
        id,
      )

    if (!organization) {
      return null
    }

    const [
      temples,
      users,
      subscriptions,
      orders,
    ] = await Promise.all([
      templeRepository.findByOrganizationId(
        conn,
        id,
      ),

      userRepository.findByOrganizationId(
        conn,
        id,
      ),

      orgSubscriptionRepository.findByOrganizationId(
        conn,
        id,
      ),

      orderRepository.findByOrganizationId(
        conn,
        id,
      ),
    ])

    const ordersWithItems =
      await Promise.all(
        orders.map(async (order) => {
          const items =
            await orderItemRepository.findByOrderId(
              conn,
              order.id,
            )

          return {
            ...order,
            items,
          }
        }),
      )

    return {
      organization,
      temples,
      users,
      subscriptions,
      orders: ordersWithItems,
    }
  },
  // ============================================================
  // CREATE ORGANIZATION
  // ============================================================

 

async create(
  data: CreateOrganizationInput,
) {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // ==========================================================
    // CHECK ORGANIZATION EMAIL
    // ==========================================================

    if (data.org_email) {
      const existingEmail =
        await organizationRepository.findByEmail(
          conn,
          data.org_email,
        )

      if (existingEmail) {
        throw new Error(
          "Organization email already exists",
        )
      }
    }

    // ==========================================================
    // CHECK ORGANIZATION PHONE
    // ==========================================================

    if (data.org_phone) {
      const existingPhone =
        await organizationRepository.findByPhone(
          conn,
          data.org_phone,
        )

      if (existingPhone) {
        throw new Error(
          "Organization phone already exists",
        )
      }
    }

    // ==========================================================
    // CHECK USER EMAIL
    // ==========================================================

    if (data.org_email) {
      // const [rows] =
      //   await conn.execute<any[]>(
      //     `
      //     SELECT id
      //     FROM users
      //     WHERE user_email = ?
      //       AND deleted_at IS NULL
      //     LIMIT 1
      //     `,
      //     [data.org_email],
      //   )
      const [rows] =
  await conn.execute<RowDataPacket[]>(
    `
    SELECT id
    FROM users
    WHERE user_email = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [data.org_email],
  )

      if (rows.length > 0) {
        throw new Error(
          "User email already exists",
        )
      }
    }

    // ==========================================================
    // CHECK USER PHONE
    // ==========================================================

    if (data.org_phone) {
      // const [rows] =
      //   await conn.execute<any[]>(
      //     `
      //     SELECT id
      //     FROM users
      //     WHERE user_phone = ?
      //       AND deleted_at IS NULL
      //     LIMIT 1
      //     `,
      //     [data.org_phone],
      //   )
      const [rows] =
  await conn.execute<RowDataPacket[]>(
    `
    SELECT id
    FROM users
    WHERE user_phone = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [data.org_phone],
  )

      if (rows.length > 0) {
        throw new Error(
          "User phone already exists",
        )
      }
    }

    // ==========================================================
    // GENERATE ORGANIZATION SLUG
    // ==========================================================

    const slug =
      await generateUniqueSlug(
        conn,
        data.org_name,
      )

    // ==========================================================
    // GET SYSTEM DEFAULTS
    // ==========================================================

    const maxUsersDefault =
      await defaultRepository.findByKey(
        conn,
        "default_max_users",
      )

    const maxTemplesDefault =
      await defaultRepository.findByKey(
        conn,
        "default_max_temples",
      )

    if (!maxUsersDefault) {
      throw new Error(
        "Default maximum users configuration not found",
      )
    }

    if (!maxTemplesDefault) {
      throw new Error(
        "Default maximum temples configuration not found",
      )
    }

    const maxUsers =
      Number(maxUsersDefault.value_int)

    const maxTemples =
      Number(maxTemplesDefault.value_int)

    // ==========================================================
    // CREATE ORGANIZATION
    // ==========================================================

    const organizationId =
      await organizationRepository.create(
        conn,
        data,
        slug,
        maxUsers,
        maxTemples,
      )

    // ==========================================================
    // CREATE ORGANIZATION ADMIN
    // ==========================================================

    const defaultPassword =
      "ChangeMe@123"

    const passwordHash =
      await argon2.hash(
        defaultPassword,
      )

    const userId =
      await userRepository.createOrganizationAdmin(
        conn,
        {
          organization_id:
            organizationId,

          user_name:
            data.user_name,

          user_email:
            data.org_email ?? null,

          user_phone:
            data.org_phone ?? null,

          user_password_hash:
            passwordHash,

          role_id: 2,
        },
      )

    // ==========================================================
    // ORDER
    // ==========================================================

    const order = data.order

    // ==========================================================
    // VALIDATE ORDER ITEMS
    // ==========================================================

    if (
      !order.items ||
      order.items.length === 0
    ) {
      throw new Error(
        "At least one order item is required",
      )
    }

    // ==========================================================
    // VALIDATE PLAN / BUNDLE ID
    // ==========================================================

    for (
      const [index, item]
      of order.items.entries()
    ) {
      const hasPlanId =
        item.plan_id !== undefined &&
        item.plan_id !== null

      const hasBundleId =
        item.bundle_id !== undefined &&
        item.bundle_id !== null

      // Must have one
      if (
        !hasPlanId &&
        !hasBundleId
      ) {
        throw new Error(
          `Plan ID or Bundle ID is required for item ${index + 1}`,
        )
      }

      // Cannot have both
      if (
        hasPlanId &&
        hasBundleId
      ) {
        throw new Error(
          `Only Plan ID or Bundle ID is allowed for item ${index + 1}`,
        )
      }

      // Plan order must contain plan
      if (
        order.item_type === "plan" &&
        !hasPlanId
      ) {
        throw new Error(
          `Plan ID is required for item ${index + 1}`,
        )
      }

      // Bundle order must contain bundle
      if (
        order.item_type === "bundle" &&
        !hasBundleId
      ) {
        throw new Error(
          `Bundle ID is required for item ${index + 1}`,
        )
      }
    }

    // ==========================================================
    // CALCULATE ORDER TOTALS
    // ==========================================================

    let subtotal = 0
    let totalGstAmount = 0

    const calculatedItems =
      order.items.map(
        (item) => {
          const quantity =
            Number(
              item.quantity ?? 1,
            )

          const unitPrice =
            Number(
              item.unit_price ?? 0,
            )

          const gstPercentage =
            Number(
              item.gst_percentage ?? 0,
            )

          const itemSubtotal =
            Number(
              (
                unitPrice *
                quantity
              ).toFixed(2),
            )

          const itemGst =
            Number(
              (
                itemSubtotal *
                gstPercentage /
                100
              ).toFixed(2),
            )

          const lineTotal =
            Number(
              (
                itemSubtotal +
                itemGst
              ).toFixed(2),
            )

          subtotal += itemSubtotal
          totalGstAmount += itemGst

          return {
            item,
            quantity,
            unitPrice,
            gstPercentage,
            itemGst,
            lineTotal,
          }
        },
      )

    subtotal =
      Number(
        subtotal.toFixed(2),
      )

    totalGstAmount =
      Number(
        totalGstAmount.toFixed(2),
      )

    const grandTotal =
      Number(
        (
          subtotal +
          totalGstAmount
        ).toFixed(2),
      )

    // ==========================================================
    // GENERATE ORDER NUMBER
    // ==========================================================

    const year =
      new Date().getFullYear()

    const orderNumber =
      `ORD-${year}-${Date.now()}`

    // ==========================================================
    // CREATE ORDER
    // ==========================================================

    const orderId =
      await orderRepository.create(
        conn,
        {
          organization_id:
            organizationId,

          organization_name:
            data.org_name,

          placed_by_name:
            data.user_name,

          order_number:
            orderNumber,

          order_status:
            "placed",

          payment_status:
            "pending",

          payment_method:
            order.payment_method,

          manual_payment_mode:
            order.manual_payment_mode ??
            null,

          manual_payment_reference:
            order.manual_payment_reference ??
            null,

          manual_payment_date:
            order.manual_payment_date ??
            null,

          manual_payment_recorded_by_name:
            data.user_name,

          subtotal,

          total_gst_amount:
            totalGstAmount,

          grand_total:
            grandTotal,

          currency:
            "INR",

          // IMPORTANT:
          // Use billing details from order
          billing_name:
            order.billing_name,

          billing_gst_number:
            data.org_gst_number ??
            null,

          billing_email:
            order.billing_email,

          billing_phone:
            data.org_phone ??
            null,

          billing_address_line1:
            order.billing_address,

          billing_address_line2:
                        order.billing_address2,

          billing_city:
            order.billing_city,

          billing_state:
            order.billing_state,

          billing_country:
            order.billing_country,

          billing_pincode:
            order.billing_pincode,

          note:
            order.note ??
            null,
        },
      )

    // ==========================================================
    // CREATE ORDER ITEMS + SUBSCRIPTIONS
    // ==========================================================

    const createdOrderItemIds: number[] = []

    const createdSubscriptionIds:
      number[] = []

    for (
      const calculated
      of calculatedItems
    ) {
      const {
        item,
        quantity,
        unitPrice,
        gstPercentage,
        itemGst,
        lineTotal,
      } = calculated

      // ========================================================
      // CREATE SUBSCRIPTION
      // ========================================================

      let orgSubscriptionId:
        number | null = null

      // --------------------------------------------------------
      // PLAN
      // --------------------------------------------------------

      if (
        order.item_type === "plan"
      ) {
        if (!item.plan_id) {
          throw new Error(
            "Plan ID is required",
          )
        }

        orgSubscriptionId =
          await orgSubscriptionRepository.create(
            conn,
            {
              organization_id:
                organizationId,

              subscription_type:
                "plan",

              plan_id:
                item.plan_id,

              granted_quantity:
                quantity,

              remaining_quantity:
                quantity,

              bundle_id:
                null,

              license_type:
                item.license_type,

              is_free_trial:
                0,

              start_date:
                item.start_date ??
                order.start_date ??
                new Date()
                  .toISOString()
                  .slice(0, 10),

              expiry_date:
                item.end_date ??
                null,

              subscription_status:
                "active",
            },
          )
      }

      // --------------------------------------------------------
      // BUNDLE
      // --------------------------------------------------------

      if (
        order.item_type === "bundle"
      ) {
        if (!item.bundle_id) {
          throw new Error(
            "Bundle ID is required",
          )
        }

        orgSubscriptionId =
          await orgSubscriptionRepository.create(
            conn,
            {
              organization_id:
                organizationId,

              subscription_type:
                "bundle",

              plan_id:
                null,

              bundle_id:
                item.bundle_id,

              granted_quantity:
                quantity,

              remaining_quantity:
                quantity,

              license_type:
                item.license_type,

              is_free_trial:
                0,

              start_date:
                item.start_date ??
                order.start_date ??
                new Date()
                  .toISOString()
                  .slice(0, 10),

              expiry_date:
                item.end_date ??
                null,

              subscription_status:
                "active",
            },
          )
      }

      // ========================================================
      // CREATE ORDER ITEM
      // ========================================================

      const orderItemId =
        await orderItemRepository.create(
          conn,
          {
            order_id:
              orderId,

            item_type:
              order.item_type,

            plan_id:
              item.plan_id ??
              null,

            bundle_id:
              item.bundle_id ??
              null,

            item_name:
              item.item_name,

            item_code:
              item.item_code,

            module_data:
              null,

            license_type:
              item.license_type,

            quantity,

            start_date:
              item.start_date ??
              order.start_date ??
              null,

            end_date:
              item.end_date ??
              null,

            unit_price:
              unitPrice,

            gst_percentage:
              gstPercentage,

            gst_amount:
              itemGst,

            line_total:
              lineTotal,

            org_subscription_id:
              orgSubscriptionId,
          },
        )

      createdOrderItemIds.push(
        orderItemId,
      )

      if (
        orgSubscriptionId
      ) {
        createdSubscriptionIds.push(
          orgSubscriptionId,
        )
      }
    }

    // ==========================================================
    // COMMIT TRANSACTION
    // ==========================================================

    await conn.commit()

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return {
      organization_id:
        organizationId,

      user_id:
        userId,

      order_id:
        orderId,

      order_item_ids:
        createdOrderItemIds,

      org_subscription_ids:
        createdSubscriptionIds,

      order_number:
        orderNumber,

      org_slug:
        slug,

      subtotal,

      gst_amount:
        totalGstAmount,

      grand_total:
        grandTotal,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
},
  // ============================================================
  // UPDATE ORGANIZATION
  // ============================================================

  async update(
    id: number,
    data: UpdateOrganizationInput,
  ) {
    const conn =
      await db.getConnection()

    try {
      await conn.beginTransaction()

      // --------------------------------------------------------
      // FIND EXISTING ORGANIZATION
      // --------------------------------------------------------

      const existing =
        await organizationRepository.findById(
          conn,
          id,
        )

      if (!existing) {
        throw new Error(
          "Organization not found",
        )
      }

      // --------------------------------------------------------
      // CHECK EMAIL
      // --------------------------------------------------------

      if (
        data.org_email &&
        data.org_email !==
          existing.org_email
      ) {
        const existingEmail =
          await organizationRepository.findByEmail(
            conn,
            data.org_email,
            id,
          )

        if (existingEmail) {
          throw new Error(
            "Organization email already exists",
          )
        }
      }

      // --------------------------------------------------------
      // CHECK PHONE
      // --------------------------------------------------------

      if (
        data.org_phone &&
        data.org_phone !==
          existing.org_phone
      ) {
        const existingPhone =
          await organizationRepository.findByPhone(
            conn,
            data.org_phone,
            id,
          )

        if (existingPhone) {
          throw new Error(
            "Organization phone already exists",
          )
        }
      }

      // --------------------------------------------------------
      // GENERATE NEW SLUG
      // --------------------------------------------------------

      let slug:
        | string
        | undefined

      if (
        data.org_name &&
        data.org_name !==
          existing.org_name
      ) {
        slug =
          await generateUniqueSlug(
            conn,
            data.org_name,
            id,
          )
      }

      // --------------------------------------------------------
      // UPDATE ORGANIZATION
      // --------------------------------------------------------

      const updated =
        await organizationRepository.update(
          conn,
          id,
          data,
          slug,
        )

      if (!updated) {
        throw new Error(
          "Organization update failed",
        )
      }

      // --------------------------------------------------------
      // GET UPDATED ORGANIZATION
      // --------------------------------------------------------

      const updatedOrganization =
        await organizationRepository.findById(
          conn,
          id,
        )

      await conn.commit()

      return updatedOrganization
    } catch (error) {
      await conn.rollback()

      throw error
    } finally {
      conn.release()
    }
  },

  async updateSubscription(
  id: number,
  data: {
    granted_quantity?: number
    remaining_quantity?: number
    start_date?: string
    expiry_date?: string | null
  },
) {
  const conn =
    await db.getConnection()

  try {
    await conn.beginTransaction()

    // const [rows] =
    //   await conn.execute<
    //     {
    //       id: number
    //     }[]
    //   >(
    //     `
    //     SELECT id
    //     FROM org_subscriptions
    //     WHERE id = ?
    //     LIMIT 1
    //     `,
    //     [id],
    //   )
const [rows] =
  await conn.execute<
    RowDataPacket[]
  >(
    `
    SELECT id
    FROM org_subscriptions
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  )
    if (rows.length === 0) {
      throw new Error(
        "Organization subscription not found",
      )
    }

    const updated =
      await orgSubscriptionRepository.update(
        conn,
        id,
        data,
      )

    if (!updated) {
      throw new Error(
        "Subscription update failed",
      )
    }

    const [updatedRows] =
      await conn.execute<
        RowDataPacket[]
      >(
        `
        SELECT
          id,
          organization_id,
          subscription_type,
          plan_id,
          bundle_id,
          granted_quantity,
          remaining_quantity,
          license_type,
          is_free_trial,
          start_date,
          expiry_date,
          subscription_status,
          created_at,
          updated_at
        FROM org_subscriptions
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      )

    await conn.commit()

    return updatedRows[0] ?? null
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
},
  // ============================================================
  // DELETE ORGANIZATION
  // ============================================================

  async remove(
    id: number,
  ) {
    const conn =
      await db.getConnection()

    try {
      await conn.beginTransaction()

      // --------------------------------------------------------
      // FIND ORGANIZATION
      // --------------------------------------------------------

      const existing =
        await organizationRepository.findById(
          conn,
          id,
        )

      if (!existing) {
        throw new Error(
          "Organization not found",
        )
      }

      // --------------------------------------------------------
      // SOFT DELETE
      // --------------------------------------------------------

      const deleted =
        await organizationRepository.remove(
          conn,
          id,
        )

      if (!deleted) {
        throw new Error(
          "Organization delete failed",
        )
      }

      await conn.commit()

      return {
        deleted: true,
      }
    } catch (error) {
      await conn.rollback()

      throw error
    } finally {
      conn.release()
    }
  },
}


