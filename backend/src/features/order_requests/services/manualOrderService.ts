import type { PoolConnection } from "mysql2/promise"

import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { orgSubscriptionRepository } from "../../organizations/repositories/orgsubscriptionRepository"
import { amcRepository } from "../../amc/amcRepository"
import { manualOrderRepository } from "../repositories/manualOrderRepository"
import { orderRequestRepository } from "../repositories/orderRequestRepository"
import type { ManualOrderInput } from "../validations/manualOrderValidation"

const round = (value: number) => Math.round(value * 100) / 100

const addMonths = (date: string, months: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCMonth(value.getUTCMonth() + Math.round(months))
  return value.toISOString().slice(0, 10)
}

const toSqlDateTime = (value: string) => new Date(value).toISOString().slice(0, 19).replace("T", " ")

const prepare = async (conn: PoolConnection, input: ManualOrderInput) => {
  const plan = await manualOrderRepository.findPlan(conn, input.plan_id)
  if (!plan) throw new HttpError(404, "Plan not found")

  const organizationName = await manualOrderRepository.findOrganizationName(conn, input.organization_id)
  if (!organizationName) throw new HttpError(404, "Organization not found")

  const isManual = input.payment_method === "manual"
  const subtotal = Number(plan.plan_price)
  const grandTotal = Number(plan.plan_total_price)
  const gstAmount = round(grandTotal - subtotal)
  const endDate =
    input.license_type === "subscription" && plan.plan_duration_months
      ? addMonths(input.start_date, Number(plan.plan_duration_months))
      : null

  return {
    plan,
    endDate,
    gstAmount,
    order: {
      ...input,
      organization_name: organizationName,
      subtotal,
      total_gst_amount: gstAmount,
      grand_total: grandTotal,
      paid_at: toSqlDateTime(input.paid_at),
      manual_payment_mode: isManual ? input.manual_payment_mode : null,
      manual_payment_date: isManual ? input.manual_payment_date : null,
      manual_payment_recorded_by_name: isManual ? input.manual_payment_recorded_by_name : null,
      payment_gateway: isManual ? null : input.payment_gateway,
      gateway_order_id: isManual ? null : input.gateway_order_id,
      gateway_payment_id: isManual ? null : input.gateway_payment_id,
      gateway_signature: isManual ? null : input.gateway_signature,
      gateway_full_response: isManual ? null : input.gateway_full_response,
    },
  }
}

const createSubscription = async (conn: PoolConnection, input: ManualOrderInput, itemId: number, quantity: number, endDate: string | null) => {
  const subscriptionId = await orgSubscriptionRepository.create(conn, {
    organization_id: input.organization_id,
    subscription_type: input.item_type as "plan" | "bundle",
    plan_id: input.plan_id,
    granted_quantity: quantity,
    remaining_quantity: quantity,
    license_type: input.license_type,
    is_free_trial: 0,
    start_date: input.start_date,
    expiry_date: endDate,
    subscription_status: "active",
  })
  await orderRequestRepository.linkItem(conn, itemId, subscriptionId)
  await amcRepository.createFirstCycle(conn, subscriptionId)
}

export const getManualOrders = (search: string) => manualOrderRepository.listOrders(search)

export const getManualOrderOptions = async () => {
  const [plans, organizations, enums] = await Promise.all([
    manualOrderRepository.listPlans(),
    manualOrderRepository.listOrganizations(),
    manualOrderRepository.listEnums(),
  ])
  return { plans, organizations, enums }
}

export const getManualOrder = (id: number) =>
  withTransaction(async (conn) => {
    const order = await manualOrderRepository.findOrderForEdit(conn, id)
    if (!order) throw new HttpError(404, "Order not found")
    return order
  })

export const createManualOrder = (input: ManualOrderInput) =>
  withTransaction(async (conn) => {
    const { plan, endDate, gstAmount, order } = await prepare(conn, input)

    const orderId = await manualOrderRepository.createOrder(conn, order)

    const itemId = await manualOrderRepository.createOrderItem(conn, {
      order_id: orderId,
      item_type: input.item_type,
      plan,
      license_type: input.license_type,
      start_date: input.start_date,
      end_date: endDate,
      gst_amount: gstAmount,
    })

    if (input.order_status === "confirmed" && input.item_type !== "amc") {
      await createSubscription(conn, input, itemId, Number(plan.plan_quantity ?? 0), endDate)
    }

    return { id: orderId, order_number: input.order_number }
  })

export const updateManualOrder = (id: number, input: ManualOrderInput) =>
  withTransaction(async (conn) => {
    const existing = await manualOrderRepository.findOrderForEdit(conn, id)
    if (!existing?.item_id) throw new HttpError(404, "Order not found")

    const { plan, endDate, gstAmount, order } = await prepare(conn, input)
    const quantity = Number(plan.plan_quantity ?? 0)

    await manualOrderRepository.updateOrder(conn, id, order)

    await manualOrderRepository.updateOrderItem(conn, existing.item_id, {
      item_type: input.item_type,
      plan,
      license_type: input.license_type,
      start_date: input.start_date,
      end_date: endDate,
      gst_amount: gstAmount,
    })

    if (existing.org_subscription_id) {
      await manualOrderRepository.updateSubscription(conn, existing.org_subscription_id, {
        organization_id: input.organization_id,
        subscription_type: input.item_type === "bundle" ? "bundle" : "plan",
        plan_id: plan.id,
        quantity,
        license_type: input.license_type,
        start_date: input.start_date,
        expiry_date: endDate,
        status: input.order_status === "cancelled" ? "cancelled" : "active",
      })
    } else if (input.order_status === "confirmed" && input.item_type !== "amc") {
      await createSubscription(conn, input, existing.item_id, quantity, endDate)
    }

    return { id, order_number: existing.order_number as string }
  })
