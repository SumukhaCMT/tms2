import type { NextFunction, Request, Response } from "express"
import type { RowDataPacket } from "mysql2/promise"

import pool from "../config/database"

const ACTIONS: Record<string, string> = { POST: "insert", PUT: "update", PATCH: "update", DELETE: "delete" }

const SKIPPED_MODULES = new Set(["auth"])

const TABLES: Record<string, string> = {
  donations: "donations",
  "donations/measurement-units": "donation_measurement_units",
  hundi: "hundi",
  "define-hundi": "define_hundi",
  "hundi-tracking": "hundi_bank_deposits",
  inventory: "inventory",
  "inventory/measurements": "inventory_measurements",
  "inventory-used": "inventory_used",
  modules: "modules",
  "sub-modules": "sub_modules",
  "subscription-plans": "subscription_plans",
  "subscription-bundles": "subscription_bundles",
  organizations: "organizations",
  "system-defaults": "system_defaults",
  roles: "default_roles",
  cart: "cart",
  "cart/items": "cart_items",
  "order-requests": "orders",
  temples: "temples",
  deities: "deities",
  "payment-methods": "payment_methods",
  "org-users": "users",
  seva: "sevas",
}

const SENSITIVE_KEY = /password|token|secret|hash/i

const numericId = (value: unknown) => (/^\d+$/.test(String(value ?? "")) ? Number(value) : null)

const sanitize = (data: unknown) =>
  data && typeof data === "object" && Object.keys(data).length
    ? JSON.stringify(Object.fromEntries(Object.entries(data).filter(([key]) => !SENSITIVE_KEY.test(key))))
    : null

const findRow = (table: string | undefined, id: number | null) =>
  table && id
    ? pool
        .query<RowDataPacket[]>(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id])
        .then(([rows]) => rows[0] ?? null)
        .catch(() => null)
    : Promise.resolve(null)

const resolveAction = (method: string, endpoint: string, pathId: number | null, after: RowDataPacket | null) => {
  if (endpoint.includes("/restore")) return "restore"
  if (method === "POST" && pathId) return "update"
  if (method === "DELETE" && after) return after.deleted_at ? "soft_delete" : "update"
  return ACTIONS[method]
}

export const activityLog = (req: Request, res: Response, next: NextFunction) => {
  if (!ACTIONS[req.method]) return next()

  const endpoint = req.originalUrl.split("?")[0]
  const [, , module = "", ...rest] = endpoint.split("/").filter(Boolean)
  if (!module || SKIPPED_MODULES.has(module)) return next()

  const subPath = rest.find((part) => !numericId(part))
  const table = TABLES[`${module}/${subPath}`] ?? TABLES[module]
  const pathId = numericId(rest.find((part) => numericId(part)))

  const json = res.json.bind(res)
  res.json = (body) => {
    res.locals.responseBody = body
    return json(body)
  }

  res.on("finish", () => {
    if (!req.user || res.statusCode >= 400) return
    const user = req.user
    const recordId = pathId ?? numericId(res.locals.responseBody?.data?.id)

    findRow(table, recordId).then((after) =>
      pool
        .execute(
          `INSERT INTO audit_logs (user_id, organization_id, temple_id, module, table_name, action, record_id, endpoint,
             old_data, new_data, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.organization_id || null,
            user.temple_id || null,
            module,
            table ?? null,
            resolveAction(req.method, endpoint, pathId, after),
            recordId,
            `${req.method} ${endpoint}`.slice(0, 255),
            sanitize(res.locals.oldData),
            sanitize(after ?? (req.method === "DELETE" ? null : req.body)),
            req.ip ?? null,
            String(req.headers["user-agent"] ?? "").slice(0, 255) || null,
          ],
        )
        .catch((error: unknown) => console.error("Activity log failed:", error)),
    )
  })

  if (!pathId) return next()

  findRow(table, pathId).then((before) => {
    res.locals.oldData = before
    next()
  })
}
