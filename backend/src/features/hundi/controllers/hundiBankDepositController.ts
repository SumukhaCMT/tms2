import type { Request, Response } from "express"

import {
  listIncompleteHundis,
  getHundiRemaining,
  listHundiBankDeposits,
  getHundiBankDepositDetail,
  searchDepositedBy,
  verifyDepositedByUser,
  createHundiBankDeposit,
  isTransactionNumberTaken,
  editHundiBankDeposit,
  removeHundiBankDeposit,
  lookupIfsc,
} from "../services/hundiBankDepositService"

import { IFSC_PATTERN } from "../ifscLookup"

import type { CreateHundiBankDepositData, UpdateHundiBankDepositData } from "../hundiTypes"
import { isInScope } from "../../../utils/scope"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

function isHundiInScope(
  hundi: { organization_id: number; temple_id: number },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, hundi.organization_id, hundi.temple_id)
}

function isTempleInScope(
  templeId: number,
  user: { organization_id: number; temple_id: number },
): boolean {
  return !user.temple_id || templeId === user.temple_id
}

export const getIncompleteHundis = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const rows = await listIncompleteHundis({
    organization_id: req.user.organization_id,
    temple_id: req.user.temple_id,
  })

  return res.status(200).json({ success: true, data: rows })
}

export const getHundiBankDeposits = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const rows = await listHundiBankDeposits({
    organization_id: req.user.organization_id,
    temple_id: req.user.temple_id,
  })

  return res.status(200).json({ success: true, data: rows })
}

export const getDepositedBySearch = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const templeId = Number(req.query.temple_id)
  if (!Number.isInteger(templeId) || templeId <= 0) {
    return res.status(400).json({ success: false, message: "temple_id is required" })
  }
  if (!isTempleInScope(templeId, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : ""
  if (query.length < 1) {
    return res.status(200).json({ success: true, data: [] })
  }

  const results = await searchDepositedBy(templeId, query)

  return res.status(200).json({ success: true, data: results })
}

export const getIfscLookup = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const code = String(req.params.code || "").trim().toUpperCase()
  if (!IFSC_PATTERN.test(code)) {
    return res.status(400).json({ success: false, message: "Invalid IFSC code format" })
  }

  const detail = await lookupIfsc(code)
  if (!detail) {
    return res.status(404).json({ success: false, message: "IFSC code not found" })
  }

  return res.status(200).json({ success: true, data: detail })
}

export const postHundiBankDeposit = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const body = req.body as Record<string, unknown>

  const hundiId = Number(body.hundi_id)
  if (!Number.isInteger(hundiId) || hundiId <= 0) {
    return res.status(400).json({ success: false, message: "Please select a hundi" })
  }

  const ifscCode = String(body.ifsc_code || "").trim().toUpperCase()
  if (!IFSC_PATTERN.test(ifscCode)) {
    return res.status(400).json({ success: false, message: "Please enter a valid IFSC code" })
  }
  if (!isNonEmptyString(body.bank_name)) {
    return res.status(400).json({ success: false, message: "Bank name is required" })
  }
  if (!isNonEmptyString(body.account_number)) {
    return res.status(400).json({ success: false, message: "Account number is required" })
  }
  if (!isNonEmptyString(body.account_holder_name)) {
    return res.status(400).json({ success: false, message: "Account holder name is required" })
  }
  if (!isNonEmptyString(body.deposit_date)) {
    return res.status(400).json({ success: false, message: "Deposit date is required" })
  }

  const depositAmount = Number(body.deposit_amount)
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ success: false, message: "Please enter a valid deposit amount" })
  }

  const depositDate = new Date(`${String(body.deposit_date)}T00:00:00Z`)
  if (Number.isNaN(depositDate.getTime()) || depositDate.getTime() > Date.now()) {
    return res.status(400).json({ success: false, message: "Deposit date cannot be in the future" })
  }

  const depositedById = Number(body.deposited_by_id)
  if (!Number.isInteger(depositedById) || depositedById <= 0) {
    return res.status(400).json({ success: false, message: "Please select who deposited this" })
  }

  const hundi = await getHundiRemaining(hundiId)
  if (!hundi) {
    return res.status(404).json({ success: false, message: "Hundi not found" })
  }
  if (!isHundiInScope(hundi, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }
  if (hundi.remaining_amount <= 0) {
    return res.status(400).json({ success: false, message: "This hundi has already been fully deposited" })
  }
  if (depositAmount > hundi.remaining_amount) {
    return res.status(400).json({
      success: false,
      message: `Deposit amount cannot exceed the remaining balance of ${hundi.remaining_amount}`,
    })
  }

  const depositedByMatch = await verifyDepositedByUser(depositedById, hundi.temple_id)
  if (!depositedByMatch) {
    return res.status(400).json({ success: false, message: "Selected depositor is not valid for this temple" })
  }

  const transactionNumber = String(body.transaction_number).trim()
  if (await isTransactionNumberTaken(transactionNumber, 0)) {
    return res.status(409).json({ success: false, message: "This transaction number has already been recorded" })
  }

  const data: CreateHundiBankDepositData = {
    organization_id: hundi.organization_id,
    temple_id: hundi.temple_id,
    deity_id: hundi.deity_id,
    hundi_id: hundiId,
    bank_name: String(body.bank_name).trim(),
    account_holder_name: String(body.account_holder_name).trim(),
    account_number: String(body.account_number).trim(),
    ifsc_code: ifscCode,
    transaction_number: transactionNumber,
    deposit_date: String(body.deposit_date),
    deposit_amount: depositAmount,
    remarks: isNonEmptyString(body.remarks) ? String(body.remarks).trim() : null,
    deposited_by: depositedByMatch.id,
    created_by: req.user.id,
  }

  const id = await createHundiBankDeposit(data)

  return res.status(201).json({ success: true, message: "Deposit recorded successfully", data: { id } })
}

export const getHundiBankDepositByIdController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid deposit ID" })
  }

  const deposit = await getHundiBankDepositDetail(id)
  if (!deposit) {
    return res.status(404).json({ success: false, message: "Deposit record not found" })
  }
  if (!isHundiInScope(deposit, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  return res.status(200).json({ success: true, data: deposit })
}

export const putHundiBankDeposit = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid deposit ID" })
  }

  const existing = await getHundiBankDepositDetail(id)
  if (!existing) {
    return res.status(404).json({ success: false, message: "Deposit record not found" })
  }
  if (!isHundiInScope(existing, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const body = req.body as Record<string, unknown>

  const ifscCode = String(body.ifsc_code || "").trim().toUpperCase()
  if (!IFSC_PATTERN.test(ifscCode)) {
    return res.status(400).json({ success: false, message: "Please enter a valid IFSC code" })
  }
  if (!isNonEmptyString(body.bank_name)) {
    return res.status(400).json({ success: false, message: "Bank name is required" })
  }
  if (!isNonEmptyString(body.account_number)) {
    return res.status(400).json({ success: false, message: "Account number is required" })
  }
  if (!isNonEmptyString(body.account_holder_name)) {
    return res.status(400).json({ success: false, message: "Account holder name is required" })
  }
  if (!isNonEmptyString(body.transaction_number)) {
    return res.status(400).json({ success: false, message: "Transaction number is required" })
  }
  if (!isNonEmptyString(body.deposit_date)) {
    return res.status(400).json({ success: false, message: "Deposit date is required" })
  }

  const depositAmount = Number(body.deposit_amount)
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ success: false, message: "Please enter a valid deposit amount" })
  }

  const depositDate = new Date(`${String(body.deposit_date)}T00:00:00Z`)
  if (Number.isNaN(depositDate.getTime()) || depositDate.getTime() > Date.now()) {
    return res.status(400).json({ success: false, message: "Deposit date cannot be in the future" })
  }

  const depositedById = Number(body.deposited_by_id)
  if (!Number.isInteger(depositedById) || depositedById <= 0) {
    return res.status(400).json({ success: false, message: "Please select who deposited this" })
  }

  if (depositAmount > existing.remaining_amount) {
    return res.status(400).json({
      success: false,
      message: `Deposit amount cannot exceed the remaining balance of ${existing.remaining_amount}`,
    })
  }

  const depositedByMatch = await verifyDepositedByUser(depositedById, existing.temple_id)
  if (!depositedByMatch) {
    return res.status(400).json({ success: false, message: "Selected depositor is not valid for this temple" })
  }

  const transactionNumber = String(body.transaction_number).trim()
  if (await isTransactionNumberTaken(transactionNumber, id)) {
    return res.status(409).json({ success: false, message: "This transaction number has already been recorded" })
  }

  const data: UpdateHundiBankDepositData = {
    bank_name: String(body.bank_name).trim(),
    account_holder_name: String(body.account_holder_name).trim(),
    account_number: String(body.account_number).trim(),
    ifsc_code: ifscCode,
    transaction_number: transactionNumber,
    deposit_date: String(body.deposit_date),
    deposit_amount: depositAmount,
    remarks: isNonEmptyString(body.remarks) ? String(body.remarks).trim() : null,
    deposited_by: depositedByMatch.id,
  }

  await editHundiBankDeposit(id, data)

  return res.status(200).json({ success: true, message: "Deposit updated successfully" })
}

export const deleteHundiBankDepositController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid deposit ID" })
  }

  const existing = await getHundiBankDepositDetail(id)
  if (!existing) {
    return res.status(404).json({ success: false, message: "Deposit record not found" })
  }
  if (!isHundiInScope(existing, req.user)) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  await removeHundiBankDeposit(id)

  return res.status(200).json({ success: true, message: "Deposit deleted successfully" })
}
