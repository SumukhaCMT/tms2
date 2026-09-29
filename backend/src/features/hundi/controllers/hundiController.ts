import type { Request, Response } from "express"
import fs from "fs"

import {
  listTemplesForOrganizationService,
  isTempleInOrganizationService,
  listDeitiesForTemple,
  listActiveDenominations,
  createHundiBatch,
  listHundisForScope,
  getHundiDetail,
  removeHundi,
  saveHundiImage,
  updateHundi,
  saveSignedReceipt,
  searchWitnessSuggestions,
} from "../services/hundiService"

import type {
  CreateHundiWitnessData,
  CreateHundiData,
  CreateHundiDenominationData,
  CreateHundiItemData,
  UpdateHundiData,
} from "../hundiTypes"

import { generateHundiReceiptPdf } from "../hundiReceiptPdf"
import {
  ensureHundiReceiptsDir,
  ensureHundiImagesDir,
  ensureHundiSignedReceiptsDir,
  hundiReceiptFilePath,
  hundiImageFilePath,
  hundiSignedReceiptFileName,
  hundiSignedReceiptFilePath,
} from "../hundiStorage"
import { isOrgScope, isInScope, hideCreator } from "../../../utils/scope"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const optionalTrim = (value: unknown): string | null => (isNonEmptyString(value) ? value.trim() : null)

function toWitnessData(witness: Record<string, unknown>): CreateHundiWitnessData {
  return {
    witness_full_name: String(witness.witness_full_name).trim(),
    witness_designation: optionalTrim(witness.witness_designation),
    witness_email: optionalTrim(witness.witness_email),
    witness_phone: optionalTrim(witness.witness_phone),
    witness_address_line1: optionalTrim(witness.witness_address_line1),
    witness_address_line2: optionalTrim(witness.witness_address_line2),
    witness_city: optionalTrim(witness.witness_city),
    witness_remarks: optionalTrim(witness.witness_remarks),
  }
}

const hasDuplicateWitness = (witnesses: CreateHundiWitnessData[]) =>
  new Set(witnesses.map((witness) => witness.witness_full_name.toLowerCase())).size !== witnesses.length

function parseExtraWitnesses(raw: unknown): CreateHundiWitnessData[] | null {
  const entries = parseJsonField<Record<string, unknown>[]>(raw, [])
  if (!Array.isArray(entries) || entries.some((entry) => !isNonEmptyString(entry?.witness_full_name))) return null
  return entries.map(toWitnessData)
}

function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (typeof raw === "string") {
    return raw.trim() ? (JSON.parse(raw) as T) : fallback
  }

  return (raw ?? fallback) as T
}

function parseDenominations(raw: unknown): CreateHundiDenominationData[] {
  return parseJsonField<Record<string, unknown>[]>(raw, [])
    .filter((entry) => Number(entry.quantity) > 0 && Number(entry.denomination_id) > 0)
    .map((entry) => ({
      denomination_id: Number(entry.denomination_id),
      quantity: Number(entry.quantity),
    }))
}

function parseItems(raw: unknown): CreateHundiItemData[] {
  return parseJsonField<Record<string, unknown>[]>(raw, [])
    .filter((entry) => isNonEmptyString(entry.item_name))
    .map((entry) => ({
      item_name: String(entry.item_name).trim(),
      quantity: entry.quantity ? Number(entry.quantity) : 1,
      measurement_weight: entry.measurement_weight ? Number(entry.measurement_weight) : null,
      measurement: entry.measurement ? String(entry.measurement).trim() : null,
      approximate_value: entry.approximate_value ? Number(entry.approximate_value) : null,
      exact_value: entry.exact_value ? Number(entry.exact_value) : null,
    }))
}

// ============================
// Create Hundi (opening) — multipart/form-data: JSON-encoded string
// fields for opened_at/temple_id/deity_ids/witness/denominations/item/
// summary/general_remark, plus an optional "hundi_image" file. Opens one
// hundi per selected deity that has an active define_hundi record.
// ============================

export const postHundi = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const body = req.body as Record<string, unknown>

    const openedAt = isNonEmptyString(body.opened_at) ? body.opened_at.trim() : ""
    if (!openedAt) {
      return res.status(400).json({ success: false, message: "opened_at is required" })
    }

    let deityIds: number[] = []
    try {
      deityIds = parseJsonField<number[]>(body.deity_ids, [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    } catch {
      return res.status(400).json({ success: false, message: "deity_ids is invalid" })
    }

    if (!deityIds.length) {
      return res.status(400).json({ success: false, message: "Select at least one deity" })
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

    let witness
    try {
      witness = parseJsonField<Record<string, unknown>>(body.witness, {})
    } catch {
      return res.status(400).json({ success: false, message: "witness details are invalid" })
    }

    if (!isNonEmptyString(witness.witness_full_name)) {
      return res.status(400).json({ success: false, message: "Witness full name is required" })
    }

    const extraWitnesses = parseExtraWitnesses(body.extra_witnesses)
    if (!extraWitnesses) {
      return res.status(400).json({ success: false, message: "Every additional witness needs a full name" })
    }

    if (hasDuplicateWitness([toWitnessData(witness), ...extraWitnesses])) {
      return res.status(400).json({ success: false, message: "The same witness cannot be added more than once" })
    }

    let denominations: CreateHundiDenominationData[] = []
    try {
      denominations = parseDenominations(body.denominations)
    } catch {
      return res.status(400).json({ success: false, message: "denominations are invalid" })
    }

    let items: CreateHundiItemData[] = []
    try {
      items = parseItems(body.items)
    } catch {
      return res.status(400).json({ success: false, message: "item details are invalid" })
    }

    const data: CreateHundiData = {
      organization_id: req.user.organization_id,
      temple_id: templeId,
      created_by: req.user.id,
      opened_at: openedAt,
      witness: toWitnessData(witness),
      extra_witnesses: extraWitnesses,
      denominations,
      items,
      hundi_image: null,
      summary: isNonEmptyString(body.summary) ? body.summary.trim() : null,
      general_remark: isNonEmptyString(body.general_remark) ? body.general_remark.trim() : null,
    }

    const outcome = await createHundiBatch(data, deityIds)

    if (outcome.missingDeityIds.length) {
      const deities = await listDeitiesForTemple(req.user.organization_id, templeId)
      const missingNames = outcome.missingDeityIds.map(
        (deityId) => deities.find((deity) => deity.id === deityId)?.name ?? `#${deityId}`,
      )

      return res.status(400).json({
        success: false,
        message: `No active Hundi is defined for: ${missingNames.join(", ")}. Please define a Hundi for this deity first.`,
      })
    }

    const createdIds = outcome.created.map((row) => row.id)

    if (req.file) {
      ensureHundiImagesDir()
      const extension = req.file.mimetype === "image/png" ? "png" : "jpg"
      const fileName = `hundi-${createdIds[0]}.${extension}`
      fs.writeFileSync(hundiImageFilePath(fileName), req.file.buffer)
      await saveHundiImage(createdIds, fileName)
    }

    // Pre-generate every receipt so it's ready the moment the post-submit
    // screen asks for it. A PDF hiccup never fails the hundi creation
    // itself — getHundiReceipt regenerates on demand.
    try {
      ensureHundiReceiptsDir()
      for (const created of outcome.created) {
        const detail = await getHundiDetail(created.id)
        if (!detail) continue
        const imagePath = detail.hundi_image ? hundiImageFilePath(detail.hundi_image) : null
        const pdfBuffer = await generateHundiReceiptPdf({ hundi: detail, imagePath })
        fs.writeFileSync(hundiReceiptFilePath(created.id), pdfBuffer)
      }
    } catch (receiptError) {
      console.error("GENERATE HUNDI RECEIPT ERROR:", receiptError)
    }

    return res.status(201).json({
      success: true,
      message: "Hundi opening recorded successfully",
      data: { created: outcome.created },
    })
  } catch (error) {
    console.error("CREATE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

function isHundiInScope(
  hundi: { organization_id: number; temple_id: number; created_by_role_id: number },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, hundi.organization_id, hundi.temple_id, hundi.created_by_role_id)
}

export const getHundis = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const hundis = await listHundisForScope({
      organization_id: req.user.organization_id,
      temple_id: req.user.temple_id,
    })

    return res.status(200).json({ success: true, data: hideCreator(hundis, req.user.role_id) })
  } catch (error) {
    console.error("GET HUNDIS ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundi = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi) {
      return res.status(404).json({ success: false, message: "Hundi not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    return res.status(200).json({ success: true, data: hideCreator([hundi], req.user.role_id)[0] })
  } catch (error) {
    console.error("GET HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const removeHundiController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi) {
      return res.status(404).json({ success: false, message: "Hundi not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    await removeHundi(id)

    return res.status(200).json({ success: true, message: "Hundi deleted successfully" })
  } catch (error) {
    console.error("DELETE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiTemples = async (req: Request, res: Response) => {
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
    console.error("GET HUNDI TEMPLES ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiDenominations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const denominations = await listActiveDenominations()

    return res.status(200).json({ success: true, data: denominations })
  } catch (error) {
    console.error("GET HUNDI DENOMINATIONS ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiDeities = async (req: Request, res: Response) => {
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
    console.error("GET HUNDI DEITIES ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi) {
      return res.status(404).json({ success: false, message: "Hundi not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const filePath = hundiReceiptFilePath(id)
    const imagePath = hundi.hundi_image ? hundiImageFilePath(hundi.hundi_image) : null
    const pdfBuffer = await generateHundiReceiptPdf({ hundi, imagePath })
    ensureHundiReceiptsDir()
    fs.writeFileSync(filePath, pdfBuffer)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="Hundi-Receipt-${hundi.hundi_number}-${id}.pdf"`)

    return res.sendFile(filePath)
  } catch (error) {
    console.error("GET HUNDI RECEIPT ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi || !hundi.hundi_image) {
      return res.status(404).json({ success: false, message: "Image not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const filePath = hundiImageFilePath(hundi.hundi_image)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Image not found" })
    }

    return res.sendFile(filePath)
  } catch (error) {
    console.error("GET HUNDI IMAGE ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const postHundiImage = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid hundi ID" })
  }

  const hundi = await getHundiDetail(id)
  if (!hundi) {
    return res.status(404).json({ success: false, message: "Hundi not found" })
  }
  if (!isHundiInScope(hundi, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Hundi image is required" })
  }

  ensureHundiImagesDir()
  const extension = req.file.mimetype === "image/png" ? "png" : "jpg"
  const fileName = `hundi-${id}.${extension}`

  if (hundi.hundi_image && hundi.hundi_image !== fileName) {
    const oldPath = hundiImageFilePath(hundi.hundi_image)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }

  fs.writeFileSync(hundiImageFilePath(fileName), req.file.buffer)
  await saveHundiImage([id], fileName)

  return res.status(200).json({ success: true, message: "Hundi image updated successfully" })
}

export const putHundi = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const existing = await getHundiDetail(id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Hundi not found" })
    }

    if (!isHundiInScope(existing, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const body = req.body as Record<string, unknown>

    let witness
    try {
      witness = parseJsonField<Record<string, unknown>>(body.witness, {})
    } catch {
      return res.status(400).json({ success: false, message: "witness details are invalid" })
    }

    if (!isNonEmptyString(witness.witness_full_name)) {
      return res.status(400).json({ success: false, message: "Witness full name is required" })
    }

    const extraWitnesses = parseExtraWitnesses(body.extra_witnesses)
    if (!extraWitnesses) {
      return res.status(400).json({ success: false, message: "Every additional witness needs a full name" })
    }

    if (hasDuplicateWitness([toWitnessData(witness), ...extraWitnesses])) {
      return res.status(400).json({ success: false, message: "The same witness cannot be added more than once" })
    }

    let denominations: CreateHundiDenominationData[] = []
    try {
      denominations = parseDenominations(body.denominations)
    } catch {
      return res.status(400).json({ success: false, message: "denominations are invalid" })
    }

    let items: CreateHundiItemData[] = []
    try {
      items = parseItems(body.items)
    } catch {
      return res.status(400).json({ success: false, message: "item details are invalid" })
    }

    const data: UpdateHundiData = {
      witness: toWitnessData(witness),
      extra_witnesses: extraWitnesses,
      denominations,
      items,
      summary: isNonEmptyString(body.summary) ? body.summary.trim() : null,
      general_remark: isNonEmptyString(body.general_remark) ? body.general_remark.trim() : null,
      updated_by: req.user.id,
    }

    await updateHundi(id, data)

    const updated = await getHundiDetail(id)

    if (updated) {
      try {
        ensureHundiReceiptsDir()
        const imagePath = updated.hundi_image ? hundiImageFilePath(updated.hundi_image) : null
        const pdfBuffer = await generateHundiReceiptPdf({ hundi: updated, imagePath })
        fs.writeFileSync(hundiReceiptFilePath(id), pdfBuffer)
      } catch (receiptError) {
        console.error("REGENERATE HUNDI RECEIPT ERROR:", receiptError)
      }
    }

    return res.status(200).json({ success: true, message: "Hundi updated successfully" })
  } catch (error) {
    console.error("UPDATE HUNDI ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const postHundiSignedReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi) {
      return res.status(404).json({ success: false, message: "Hundi not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    if (!req.file) {
      console.error("UPLOAD HUNDI SIGNED RECEIPT: no file received", {
        contentType: req.headers["content-type"],
        bodyKeys: Object.keys(req.body ?? {}),
      })
      return res.status(400).json({ success: false, message: "Signed receipt PDF is required" })
    }

    ensureHundiSignedReceiptsDir()
    const fileName = hundiSignedReceiptFileName(id)
    fs.writeFileSync(hundiSignedReceiptFilePath(fileName), req.file.buffer)
    await saveSignedReceipt(id, fileName)

    return res.status(200).json({ success: true, message: "Signed receipt uploaded successfully" })
  } catch (error) {
    console.error("UPLOAD HUNDI SIGNED RECEIPT ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getHundiSignedReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid hundi ID" })
    }

    const hundi = await getHundiDetail(id)
    if (!hundi || !hundi.signed_receipt_pdf_path) {
      return res.status(404).json({ success: false, message: "Signed receipt not found" })
    }

    if (!isHundiInScope(hundi, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const filePath = hundiSignedReceiptFilePath(hundi.signed_receipt_pdf_path)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Signed receipt not found" })
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="Hundi-Signed-Receipt-${hundi.hundi_number}-${id}.pdf"`)

    return res.sendFile(filePath)
  } catch (error) {
    console.error("GET HUNDI SIGNED RECEIPT ERROR:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getWitnessSuggestions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : ""

  if (!query) {
    return res.status(200).json({ success: true, data: [] })
  }

  const suggestions = await searchWitnessSuggestions(
    { organization_id: req.user.organization_id, temple_id: req.user.temple_id },
    query,
  )

  return res.status(200).json({ success: true, data: suggestions })
}
