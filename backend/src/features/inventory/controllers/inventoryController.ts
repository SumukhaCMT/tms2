import type { Request, Response } from "express"

import {
  listTemplesForOrganizationService,
  isTempleInOrganizationService,
  listInventoryItemTypes,
  searchGivenBy,
  searchInventoryItemSuggestions,
  createInventoryBatch,
  listInventoryForScope,
  getInventoryDetail,
  removeInventory,
  getInventoryGroup,
  updateInventoryGroupService,
  getTempleNameService,
} from "../services/inventoryService"
import { listInventoryUsageHistory } from "../services/inventoryUsedService"

import type { InventoryBatchData, InventoryBatchItemData, InventoryItemType } from "../inventoryTypes"

import { generateInventoryReceiptPdf } from "../inventoryReceiptPdf"
import { isOrgScope, isInScope, hideCreator } from "../../../utils/scope"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const optionalText = (value: unknown): string | null =>
  isNonEmptyString(value) ? value.trim() : null

function isInventoryInScope(
  inventory: { inventory_organization_id: number; inventory_temple_id: number; created_by_role_id: number },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, inventory.inventory_organization_id, inventory.inventory_temple_id, inventory.created_by_role_id)
}

function parseInventoryBatch(body: Record<string, unknown>, allowedTypes: InventoryItemType[]): { data: InventoryBatchData | null; error: string | null } {
  if (!isNonEmptyString(body.given_by)) {
    return { data: null, error: "Given by is required" }
  }

  if (!isNonEmptyString(body.given_at)) {
    return { data: null, error: "Pick a date for when the items were given" }
  }

  if (!allowedTypes.includes(body.item_type as InventoryItemType)) {
    return { data: null, error: "Select a valid item type" }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { data: null, error: "Add at least one inventory item" }
  }

  const items: InventoryBatchItemData[] = []
  const seenNames = new Set<string>()

  for (const entry of body.items as Record<string, unknown>[]) {
    if (!isNonEmptyString(entry.item_name)) {
      return { data: null, error: "Item name is required" }
    }

    const nameKey = entry.item_name.trim().toLowerCase().replace(/\s+/g, " ")
    if (seenNames.has(nameKey)) {
      return { data: null, error: `"${entry.item_name.trim()}" is added more than once` }
    }
    seenNames.add(nameKey)

    const stockQuantity = Number(entry.stock_quantity)
    if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
      return { data: null, error: "Enter a valid stock quantity" }
    }

    const unitId = Number(entry.unit_id)
    if (!Number.isInteger(unitId) || unitId <= 0) {
      return { data: null, error: "Select a measurement unit" }
    }

    const measurement = entry.measurement ? Number(entry.measurement) : null
    if (measurement !== null && (!Number.isFinite(measurement) || measurement <= 0)) {
      return { data: null, error: "Enter valid units" }
    }

    const id = Number(entry.id)

    items.push({
      id: Number.isInteger(id) && id > 0 ? id : null,
      item_name: entry.item_name.trim(),
      stock_quantity: stockQuantity,
      unit_id: unitId,
      measurement,
    })
  }

  return {
    data: {
      given_by: body.given_by.trim(),
      given_at: body.given_at.trim(),
      item_type: body.item_type as InventoryItemType,
      stored_at: optionalText(body.stored_at),
      remarks: optionalText(body.remarks),
      items,
    },
    error: null,
  }
}

export const postInventory = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const body = req.body as Record<string, unknown>

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

  const allowedTypes = await listInventoryItemTypes()
  const { data, error } = parseInventoryBatch(body, allowedTypes)

  if (!data) {
    return res.status(400).json({ success: false, message: error })
  }

  const created = await createInventoryBatch({
    ...data,
    items: data.items.map((item) => ({ ...item, id: null })),
    organization_id: req.user.organization_id,
    temple_id: templeId,
    created_by: req.user.id,
  })

  return res.status(201).json({
    success: true,
    message: "Inventory recorded successfully",
    data: { id: created[0].id, created },
  })
}

export const getInventoryList = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const inventory = await listInventoryForScope({
    organization_id: req.user.organization_id,
    temple_id: req.user.temple_id,
  })

  return res.status(200).json({ success: true, data: hideCreator(inventory, req.user.role_id) })
}

export const getInventoryById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid inventory ID" })
  }

  const inventory = await getInventoryDetail(id)
  if (!inventory) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryInScope(inventory, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const usages = await listInventoryUsageHistory(id)

  const [visible] = hideCreator([inventory], req.user.role_id)

  return res.status(200).json({ success: true, data: { ...visible, usages } })
}

export const removeInventoryController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid inventory ID" })
  }

  const inventory = await getInventoryDetail(id)
  if (!inventory) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryInScope(inventory, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  await removeInventory(id)

  return res.status(200).json({ success: true, message: "Inventory item deleted successfully" })
}

export const getInventoryGroupController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid inventory ID" })
  }

  const group = await getInventoryGroup(id)
  if (!group) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryInScope({ inventory_organization_id: group.organization_id, inventory_temple_id: group.temple_id, created_by_role_id: group.created_by_role_id }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const [visible] = hideCreator([group], req.user.role_id)

  return res.status(200).json({ success: true, data: visible })
}

export const putInventory = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid inventory ID" })
  }

  const group = await getInventoryGroup(id)
  if (!group) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryInScope({ inventory_organization_id: group.organization_id, inventory_temple_id: group.temple_id, created_by_role_id: group.created_by_role_id }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const allowedTypes = await listInventoryItemTypes()
  const { data, error } = parseInventoryBatch(req.body as Record<string, unknown>, allowedTypes)

  if (!data) {
    return res.status(400).json({ success: false, message: error })
  }

  const groupIds = new Set(group.items.map((item) => item.id))
  if (data.items.some((item) => item.id && !groupIds.has(item.id))) {
    return res.status(400).json({ success: false, message: "Item does not belong to this inventory entry" })
  }

  const firstId = await updateInventoryGroupService(group, req.user.id, data)

  return res.status(200).json({ success: true, message: "Inventory updated successfully", data: { id: firstId } })
}

export const getInventoryTemples = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  if (req.user.temple_id) {
    return res.status(200).json({ success: true, data: [] })
  }

  const temples = await listTemplesForOrganizationService(req.user.organization_id)

  return res.status(200).json({ success: true, data: temples })
}

export const getInventoryCurrentTemple = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  if (!req.user.temple_id) {
    return res.status(200).json({ success: true, data: null })
  }

  const templeName = await getTempleNameService(req.user.temple_id)

  return res.status(200).json({
    success: true,
    data: templeName ? { id: req.user.temple_id, temp_name: templeName } : null,
  })
}

export const getInventoryItemTypeOptionsController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const itemTypes = await listInventoryItemTypes()

  return res.status(200).json({ success: true, data: itemTypes })
}

export const getInventoryGivenBySuggestions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : ""

  if (query.length < 1) {
    return res.status(200).json({ success: true, data: [] })
  }

  const suggestions = await searchGivenBy(
    {
      organization_id: req.user.organization_id,
      temple_id: req.user.temple_id,
    },
    query,
  )

  return res.status(200).json({ success: true, data: suggestions })
}

export const getInventoryItemSuggestions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : ""

  if (!query) {
    return res.status(200).json({ success: true, data: [] })
  }

  const suggestions = await searchInventoryItemSuggestions(
    {
      organization_id: req.user.organization_id,
      temple_id: req.user.temple_id,
    },
    query,
  )

  return res.status(200).json({ success: true, data: suggestions })
}

export const getInventoryReceipt = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid inventory ID" })
  }

  const group = await getInventoryGroup(id)
  if (!group) {
    return res.status(404).json({ success: false, message: "Inventory item not found" })
  }

  if (!isInventoryInScope({ inventory_organization_id: group.organization_id, inventory_temple_id: group.temple_id, created_by_role_id: group.created_by_role_id }, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const pdfBuffer = await generateInventoryReceiptPdf(group)

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `inline; filename="Inventory-Receipt-${group.items[0]?.id ?? id}.pdf"`)

  return res.send(pdfBuffer)
}
