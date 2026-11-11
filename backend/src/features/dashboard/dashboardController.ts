import type { Request, Response } from "express"

import { HttpError } from "../../utils/httpError"
import { isOrgScope } from "../../utils/scope"
import { getOrgBreakdowns, getOrgMonthlyRevenue, getOrgSummary, getOrgTempleBreakdown } from "./dashboardRepository"

const TEXT_KEYS = new Set(["temp_name", "temp_status", "next_expiry"])

const toNumbers = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [key, TEXT_KEYS.has(key) ? value : Number(value ?? 0)]))

export const getOrgDashboard = async (req: Request, res: Response) => {
  const user = req.user!
  if (!isOrgScope(user)) throw new HttpError(403, "Organization dashboard is only available to organization admins")

  const orgId = Number(user.organization_id)
  const [summary, monthly, temples, breakdowns] = await Promise.all([
    getOrgSummary(orgId),
    getOrgMonthlyRevenue(orgId),
    getOrgTempleBreakdown(orgId),
    getOrgBreakdowns(orgId),
  ])

  res.json({ success: true, data: { summary: toNumbers(summary), monthly, temples: temples.map(toNumbers), ...breakdowns } })
}
