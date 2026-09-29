import type { Request, Response } from "express"

import { checkUsageAgainstStock } from "../services/measurementService"

import {
  listInventoryItemOptionsService,
  getInventoryStockSummaryService,
  createInventoryUsed,
  listInventoryUsedForScope,
  getInventoryUsedDetail,
  updateInventoryUsed,
  removeInventoryUsed,
} from "../services/inventoryUsedService"

import type { CreateInventoryUsedData, UpdateInventoryUsedData } from "../inventoryTypes"
import { isInScope } from "../../../utils/scope"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

function isInventoryUsedInScope(
  record: { inventory_organization_id: number; inventory_temple_id: number },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, record.inventory_organization_id, record.inventory_temple_id)
}

export const getInventoryUsedItemOptions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const items = await listInventoryItemOptionsService({
    organization_id: req.user.organization_id,
    temple_id: req.user.temple_id,
  })

  return res.status(200).json({ success: true, data: items })
}

export const getInventoryUsedStockSummary = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const itemId = Number(req.params.itemId)
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid item ID" })
  }

  const excludeUsedId = Number(req.query.exclude_id) || 0

  const summary = await getInventoryStockSummaryService(itemId, excludeUsedId)
  if (!summary) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: summary.inventory_organization_id,
    inventory_temple_id: summary.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  return res.status(200).json({ success: true, data: summary })
}

export const postInventoryUsed = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const body = req.body as Record<string, unknown>

  const itemId = Number(body.item_id)
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ success: false, message: "Select an inventory item" })
  }

  const summary = await getInventoryStockSummaryService(itemId, 0)
  if (!summary) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: summary.inventory_organization_id,
    inventory_temple_id: summary.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const usedQuantity = Number(body.used_quantity)
  if (!Number.isFinite(usedQuantity) || usedQuantity <= 0) {
    return res.status(400).json({ success: false, message: "Enter a valid quantity used" })
  }

  const usedUnit = Number(body.used_unit)
  if (!Number.isInteger(usedUnit) || usedUnit <= 0) {
    return res.status(400).json({ success: false, message: "Select a measurement unit" })
  }

  const usedMeasurement = body.used_measurement ? Number(body.used_measurement) : null
  const stockError = await checkUsageAgainstStock(summary, usedUnit, usedQuantity, usedMeasurement)
  if (stockError) {
    return res.status(400).json({ success: false, message: stockError })
  }

  if (!isNonEmptyString(body.used_where)) {
    return res.status(400).json({ success: false, message: "Enter where the item was used" })
  }

  if (!isNonEmptyString(body.used_date)) {
    return res.status(400).json({ success: false, message: "Pick a date for when the item was used" })
  }

  const data: CreateInventoryUsedData = {
    organization_id: summary.inventory_organization_id,
    temple_id: summary.inventory_temple_id,
    created_by: req.user.id,
    item_id: itemId,
    used_quantity: usedQuantity,
    used_unit: usedUnit,
    used_measurement: usedMeasurement,
    used_where: String(body.used_where).trim(),
    used_date: String(body.used_date).trim(),
    remarks: body.remarks ? String(body.remarks).trim() : null,
  }

  const created = await createInventoryUsed(data)

  return res.status(201).json({
    success: true,
    message: "Inventory usage recorded successfully",
    data: created,
  })
}

export const getInventoryUsedList = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const records = await listInventoryUsedForScope({
    organization_id: req.user.organization_id,
    temple_id: req.user.temple_id,
  })

  return res.status(200).json({ success: true, data: records })
}

export const getInventoryUsedById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid usage record ID" })
  }

  const record = await getInventoryUsedDetail(id)
  if (!record) {
    return res.status(404).json({ success: false, message: "Usage record not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: record.inventory_organization_id,
    inventory_temple_id: record.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  return res.status(200).json({ success: true, data: record })
}

export const putInventoryUsed = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid usage record ID" })
  }

  const existing = await getInventoryUsedDetail(id)
  if (!existing) {
    return res.status(404).json({ success: false, message: "Usage record not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: existing.inventory_organization_id,
    inventory_temple_id: existing.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const body = req.body as Record<string, unknown>

  const itemId = Number(body.item_id)
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ success: false, message: "Select an inventory item" })
  }

  const summary = await getInventoryStockSummaryService(itemId, id)
  if (!summary) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: summary.inventory_organization_id,
    inventory_temple_id: summary.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const usedQuantity = Number(body.used_quantity)
  if (!Number.isFinite(usedQuantity) || usedQuantity <= 0) {
    return res.status(400).json({ success: false, message: "Enter a valid quantity used" })
  }

  const usedUnit = Number(body.used_unit)
  if (!Number.isInteger(usedUnit) || usedUnit <= 0) {
    return res.status(400).json({ success: false, message: "Select a measurement unit" })
  }

  const usedMeasurement = body.used_measurement ? Number(body.used_measurement) : null
  const stockError = await checkUsageAgainstStock(summary, usedUnit, usedQuantity, usedMeasurement)
  if (stockError) {
    return res.status(400).json({ success: false, message: stockError })
  }

  if (!isNonEmptyString(body.used_where)) {
    return res.status(400).json({ success: false, message: "Enter where the item was used" })
  }

  if (!isNonEmptyString(body.used_date)) {
    return res.status(400).json({ success: false, message: "Pick a date for when the item was used" })
  }

  const data: UpdateInventoryUsedData = {
    item_id: itemId,
    used_quantity: usedQuantity,
    used_unit: usedUnit,
    used_measurement: usedMeasurement,
    used_where: String(body.used_where).trim(),
    used_date: String(body.used_date).trim(),
    remarks: body.remarks ? String(body.remarks).trim() : null,
  }

  await updateInventoryUsed(id, data)

  return res.status(200).json({ success: true, message: "Usage record updated successfully" })
}

export const removeInventoryUsedController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid usage record ID" })
  }

  const existing = await getInventoryUsedDetail(id)
  if (!existing) {
    return res.status(404).json({ success: false, message: "Usage record not found" })
  }

  if (!isInventoryUsedInScope({
    inventory_organization_id: existing.inventory_organization_id,
    inventory_temple_id: existing.inventory_temple_id,
  }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  await removeInventoryUsed(id)

  return res.status(200).json({ success: true, message: "Usage record deleted successfully" })
}
