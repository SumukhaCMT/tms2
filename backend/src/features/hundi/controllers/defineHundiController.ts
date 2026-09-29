import type { Request, Response } from "express"

import {
  createDefineHundi,
  listDefineHundisForScope,
  getDefineHundi,
  editDefineHundi,
  removeDefineHundi,
} from "../services/defineHundiService"

import { listTemplesForOrganizationService, isTempleInOrganizationService, listDeitiesForTemple } from "../services/hundiService"

import type { CreateDefineHundiData, UpdateDefineHundiData } from "../hundiTypes"
import { isOrgScope, isInScope } from "../../../utils/scope"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

function isDefineHundiInScope(
  defineHundi: { organization_id: number; temple_id: number },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, defineHundi.organization_id, defineHundi.temple_id)
}

export const postDefineHundi = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const body = req.body as Record<string, unknown>

    if (!isNonEmptyString(body.hundi_number)) {
      return res.status(400).json({ success: false, message: "Hundi number is required" })
    }
    if (!isNonEmptyString(body.hundi_name)) {
      return res.status(400).json({ success: false, message: "Hundi name is required" })
    }

    const deityId = Number(body.deity_id)
    if (!Number.isInteger(deityId) || deityId <= 0) {
      return res.status(400).json({ success: false, message: "Please select a deity" })
    }

    let templeId = req.user.temple_id

    if (isOrgScope(req.user)) {
      const requestedTempleId = Number(body.temple_id)

      if (!Number.isInteger(requestedTempleId) || requestedTempleId <= 0) {
        return res.status(400).json({ success: false, message: "Please select a temple" })
      }

      const belongsToOrg = await isTempleInOrganizationService(requestedTempleId, req.user.organization_id)
      if (!belongsToOrg) {
        return res.status(403).json({ success: false, message: "Selected temple does not belong to your organization" })
      }

      templeId = requestedTempleId
    }

    const deities = await listDeitiesForTemple(req.user.organization_id, templeId)
    if (!deities.some((deity) => deity.id === deityId)) {
      return res.status(400).json({ success: false, message: "Selected deity does not belong to this temple" })
    }

    const data: CreateDefineHundiData = {
      organization_id: req.user.organization_id,
      temple_id: templeId,
      deity_id: deityId,
      hundi_number: String(body.hundi_number).trim(),
      hundi_name: String(body.hundi_name).trim(),
      created_by: req.user.id,
    }

    const id = await createDefineHundi(data)

    return res.status(201).json({ success: true, message: "Hundi defined successfully", data: { id } })
  } catch (error) {
    const mysqlError = error as { code?: string }

    if (mysqlError.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A Hundi with this number or name already exists for this temple and deity",
      })
    }

    console.error("CREATE DEFINE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getDefineHundis = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const rows = await listDefineHundisForScope({
      organization_id: req.user.organization_id,
      temple_id: req.user.temple_id,
    })

    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("GET DEFINE HUNDIS ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const putDefineHundi = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid Hundi ID" })
    }

    const existing = await getDefineHundi(id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Hundi definition not found" })
    }
    if (!isDefineHundiInScope(existing, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const body = req.body as Record<string, unknown>

    if (!isNonEmptyString(body.hundi_number)) {
      return res.status(400).json({ success: false, message: "Hundi number is required" })
    }
    if (!isNonEmptyString(body.hundi_name)) {
      return res.status(400).json({ success: false, message: "Hundi name is required" })
    }

    const deityId = Number(body.deity_id)
    if (!Number.isInteger(deityId) || deityId <= 0) {
      return res.status(400).json({ success: false, message: "Please select a deity" })
    }

    const status = body.status === "inactive" ? "inactive" : "active"

    const deities = await listDeitiesForTemple(existing.organization_id, existing.temple_id)
    if (!deities.some((deity) => deity.id === deityId)) {
      return res.status(400).json({ success: false, message: "Selected deity does not belong to this temple" })
    }

    const data: UpdateDefineHundiData = {
      deity_id: deityId,
      hundi_number: String(body.hundi_number).trim(),
      hundi_name: String(body.hundi_name).trim(),
      status,
      updated_by: req.user.id,
    }

    await editDefineHundi(id, data)

    return res.status(200).json({ success: true, message: "Hundi updated successfully" })
  } catch (error) {
    const mysqlError = error as { code?: string }

    if (mysqlError.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A Hundi with this number or name already exists for this temple and deity",
      })
    }

    console.error("UPDATE DEFINE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const removeDefineHundiController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid Hundi ID" })
    }

    const existing = await getDefineHundi(id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Hundi definition not found" })
    }
    if (!isDefineHundiInScope(existing, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    await removeDefineHundi(id)

    return res.status(200).json({ success: true, message: "Hundi deleted successfully" })
  } catch (error) {
    console.error("DELETE DEFINE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getDefineHundiTemples = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    if (req.user.temple_id) {
      return res.status(200).json({ success: true, data: [] })
    }

    const temples = await listTemplesForOrganizationService(req.user.organization_id)

    return res.status(200).json({ success: true, data: temples })
  } catch (error) {
    console.error("GET DEFINE HUNDI TEMPLES ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getDefineHundiDeities = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    let templeId = req.user.temple_id

    if (isOrgScope(req.user)) {
      const requestedTempleId = Number(req.query.temple_id)

      if (!Number.isInteger(requestedTempleId) || requestedTempleId <= 0) {
        return res.status(200).json({ success: true, data: [] })
      }

      const belongsToOrg = await isTempleInOrganizationService(requestedTempleId, req.user.organization_id)
      if (!belongsToOrg) {
        return res.status(403).json({ success: false, message: "Selected temple does not belong to your organization" })
      }

      templeId = requestedTempleId
    }

    const deities = await listDeitiesForTemple(req.user.organization_id, templeId)

    return res.status(200).json({ success: true, data: deities })
  } catch (error) {
    console.error("GET DEFINE HUNDI DEITIES ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
