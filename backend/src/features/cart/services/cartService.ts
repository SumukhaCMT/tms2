import type { Pool, PoolConnection } from "mysql2/promise"

import db from "../../../config/database"
import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { cartRepository } from "../repositories/cartRepository"
import { amcRepository } from "../../amc/amcRepository"
import type { AddCartItemInput, CartItem, CartItemType, CatalogItem, CheckoutInput, CreditSubscription, CreditType, PlacedOrder, UpcomingModule, UpcomingPlan } from "../cartTypes"

interface CartUser {
  id: number
  organization_id: number
}

const round = (value: number) => Math.round(value * 100) / 100

const nullableNumber = (value: unknown) => (value === null ? null : Number(value))

const toCartItem = (row: CartItem): CartItem => ({
  ...row,
  quantity: nullableNumber(row.quantity),
  unit_price: Number(row.unit_price),
  gst_percentage: Number(row.gst_percentage),
  gst_amount: Number(row.gst_amount),
  line_total: Number(row.line_total),
})

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

const addMonths = (date: string, months: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCMonth(value.getUTCMonth() + Math.round(months))
  return value.toISOString().slice(0, 10)
}

interface ScheduledPlan {
  module_id: number
  start_date: string
  end_date: string | null
}

interface AmcSnapshot {
  amount: number
  gst_percentage: number
  duration_months: number
  start_date?: string
  end_date?: string
}

const parseSnapshot = (snapshot: unknown) => (typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot) as { module_id?: number; amc?: AmcSnapshot; plans?: { module_id: number; plan_name: string; start_date?: string; end_date?: string | null }[] }

const endDateFor = (line: CatalogItem, startDate: string) =>
  line.license_type === "subscription" && line.duration_months ? addMonths(startDate, line.duration_months) : null

const scheduleLine = async (conn: PoolConnection, organizationId: number, line: CatalogItem, earliestStart: string) => {
  const snapshot = parseSnapshot(line.snapshot)
  const isBundle = line.item_type === "bundle"
  const plans = isBundle ? snapshot.plans ?? [] : [{ module_id: Number(snapshot.module_id) }]
  const queueEnds = await cartRepository.findModuleQueueEnds(conn, organizationId, plans.map((plan) => Number(plan.module_id)))

  const scheduled: ScheduledPlan[] = plans.map((plan) => {
    const queueEnd = queueEnds.get(Number(plan.module_id))
    const startDate = queueEnd && queueEnd > earliestStart ? queueEnd : earliestStart
    return { ...plan, start_date: startDate, end_date: endDateFor(line, startDate) }
  })

  const startDate = scheduled.map((plan) => plan.start_date).sort()[0] ?? earliestStart
  const ends = scheduled.map((plan) => plan.end_date)
  const endDate = ends.length && ends.every(Boolean) ? (ends as string[]).sort().reverse()[0] : endDateFor(line, startDate)

  const amc = snapshot.amc ? { ...snapshot.amc, start_date: startDate, end_date: addMonths(startDate, snapshot.amc.duration_months) } : null

  return {
    line: isBundle
      ? { ...line, snapshot: JSON.stringify({ ...snapshot, plans: scheduled }) }
      : amc
        ? { ...line, snapshot: JSON.stringify({ ...snapshot, amc }) }
        : line,
    start_date: startDate,
    end_date: endDate,
  }
}

const loadCatalogItem = async (conn: PoolConnection, type: CartItemType, id: number): Promise<CatalogItem | null> => {
  const row = await cartRepository.findCatalogItem(conn, type, id)
  if (!row) return null
  let unitPrice = Number(row.unit_price)
  let lineTotal = Number(row.line_total)
  let snapshot = row.snapshot

  if (type === "plan" && row.license_type === "perpetual") {
    const terms = await amcRepository.resolveTerms(conn, type, id)
    unitPrice = round(unitPrice + terms.amc_amount)
    lineTotal = round(lineTotal + terms.amc_amount + (terms.amc_amount * terms.amc_gst_percentage) / 100)
    snapshot = JSON.stringify({
      ...parseSnapshot(row.snapshot),
      amc: { amount: terms.amc_amount, gst_percentage: terms.amc_gst_percentage, duration_months: terms.duration_months },
    })
  }

  return {
    ...row,
    snapshot,
    duration_months: nullableNumber(row.duration_months),
    quantity: nullableNumber(row.quantity),
    unit_price: unitPrice,
    gst_percentage: Number(row.gst_percentage),
    gst_amount: round(lineTotal - unitPrice),
    line_total: lineTotal,
  }
}

const listItems = async (conn: PoolConnection | typeof db, cartId: number | null) =>
  cartId ? (await cartRepository.listItems(conn, cartId)).map(toCartItem) : []

export const getCart = async (user: CartUser) => listItems(db, await cartRepository.findActiveCartId(db, user.id))

export const addCartItem = (user: CartUser, input: AddCartItemInput) =>
  withTransaction(async (conn) => {
    const type: CartItemType = input.plan_id ? "plan" : "bundle"
    const line = await loadCatalogItem(conn, type, Number(input.plan_id ?? input.bundle_id))
    if (!line) throw new HttpError(404, `This ${type} is not available`)

    const cartId =
      (await cartRepository.findActiveCartId(conn, user.id, true)) ??
      (await cartRepository.createCart(conn, user.organization_id, user.id))

    await cartRepository.deleteItems(conn, cartId, input.replace_ids)
    await cartRepository.upsertItem(conn, cartId, line)
    await cartRepository.touchCart(conn, cartId)
    return listItems(conn, cartId)
  })

export const removeCartItem = (user: CartUser, itemId: number) =>
  withTransaction(async (conn) => {
    const cartId = await cartRepository.findActiveCartId(conn, user.id, true)
    if (cartId) {
      await cartRepository.deleteItems(conn, cartId, [itemId])
      await cartRepository.touchCart(conn, cartId)
    }
    return listItems(conn, cartId)
  })

export const checkout = (user: CartUser, input: CheckoutInput) =>
  withTransaction(async (conn): Promise<PlacedOrder> => {
    const cartId = await cartRepository.findActiveCartId(conn, user.id, true)
    const items = await listItems(conn, cartId)
    if (!cartId || items.length === 0) throw new HttpError(400, "Your cart is empty")

    const lines: CatalogItem[] = []
    for (const item of items) {
      const line = await loadCatalogItem(conn, item.item_type, Number(item.plan_id ?? item.bundle_id))
      if (!line) throw new HttpError(409, `${item.item_name} is no longer available. Remove it from your cart.`)
      await cartRepository.upsertItem(conn, cartId, line)
      lines.push(line)
    }

    const billing = await cartRepository.findBilling(conn, user.organization_id)
    if (!billing) throw new HttpError(404, "Organization not found")

    const subtotal = round(lines.reduce((sum, line) => sum + line.unit_price, 0))
    const grandTotal = round(lines.reduce((sum, line) => sum + line.line_total, 0))
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now()}`

    const orderId = await cartRepository.createOrder(conn, {
      ...input,
      organization_id: user.organization_id,
      order_number: orderNumber,
      placed_by_name: await cartRepository.findUserName(conn, user.id),
      subtotal,
      total_gst_amount: round(grandTotal - subtotal),
      grand_total: grandTotal,
      billing,
    })

    const earliestStart = addDays(input.payment_date, 1)

    for (const line of lines) {
      await cartRepository.createOrderItem(conn, {
        order_id: orderId,
        ...(await scheduleLine(conn, user.organization_id, line, earliestStart)),
      })
    }

    await cartRepository.markOrdered(conn, cartId, orderId)

    return {
      id: orderId,
      order_number: orderNumber,
      grand_total: grandTotal,
      payment_mode: input.payment_mode,
      transaction_number: input.transaction_number,
      payment_date: input.payment_date,
    }
  })

export const getActiveSubscriptions = async (user: CartUser) =>
  (await cartRepository.listActiveSubscriptions(db, user.organization_id)).map((row) => ({
    ...row,
    amount_paid: nullableNumber(row.amount_paid),
  }))

const upcomingModules = (row: UpcomingPlan): UpcomingModule[] => {
  if (row.item_type !== "bundle" || !row.module_data) return []
  const plans = parseSnapshot(row.module_data).plans ?? []
  return plans.map((plan) => ({
    plan_name: plan.plan_name,
    start_date: plan.start_date ?? row.start_date,
    end_date: plan.start_date ? plan.end_date ?? null : row.end_date,
  }))
}

export const getUpcomingPlans = async (user: CartUser) =>
  (await cartRepository.listUpcoming(db, user.organization_id)).map(({ module_data, ...row }) => ({
    ...row,
    line_total: Number(row.line_total),
    modules: upcomingModules({ ...row, module_data }),
  }))

export const getExpiredPlans = (user: CartUser) => cartRepository.listExpiredPlans(db, user.organization_id)

export const discardCart = (user: CartUser) => cartRepository.discardCart(db, user.id)

const CREDIT_TYPES: CreditType[] = ["whatsapp"]

const creditType = (type: string) => {
  if (!CREDIT_TYPES.includes(type as CreditType)) throw new HttpError(400, "Unsupported credit type")
  return type as CreditType
}

const splitCredits = (rows: CreditSubscription[]) => {
  const live = rows.filter((row) => Number(row.is_live))
  return {
    live,
    next: rows.find((row) => !Number(row.is_live)),
    remaining: live.reduce((sum, row) => sum + Number(row.remaining_quantity), 0),
  }
}

const readCredits = async (ex: Pool | PoolConnection, organizationId: number, type: CreditType) => {
  const { live, next, remaining } = splitCredits(await cartRepository.listCredits(ex, organizationId, type))
  return {
    remaining,
    expiry_date: live.length ? live[live.length - 1].expiry_date : null,
    next: next
      ? { id: next.id, plan_name: next.plan_name, credits: Number(next.granted_quantity), start_date: next.start_date, expiry_date: next.expiry_date }
      : null,
  }
}

export const getCredits = (user: CartUser, type: string) => readCredits(db, user.organization_id, creditType(type))

export const activateCredits = (user: CartUser, type: string) =>
  withTransaction(async (conn) => {
    const credit = creditType(type)
    const { live, next, remaining } = splitCredits(await cartRepository.listCredits(conn, user.organization_id, credit, true))
    if (remaining > 0) throw new HttpError(400, "Existing credits are still available")
    if (!next) throw new HttpError(404, "No purchased plan available to activate")
    if (live.length) await cartRepository.closeCredits(conn, live.map((row) => row.id))
    await cartRepository.startCredits(conn, next.id)
    return readCredits(conn, user.organization_id, credit)
  })
