import {
  getIncompleteHundisForScope,
  getHundiRemainingById,
  getHundiBankDepositsForScope,
  getHundiBankDepositById,
  searchDepositedByForTemple,
  findDepositedByUser,
  insertHundiBankDeposit,
  findDepositByTransactionNumber,
  updateHundiBankDeposit,
  deleteHundiBankDepositById,
} from "../repositories/hundiBankDepositRepository"

import { fetchIfscDetail } from "../ifscLookup"

import type {
  IncompleteHundiOption,
  HundiRemaining,
  HundiBankDepositListItem,
  HundiBankDepositDetail,
  DepositedByOption,
  CreateHundiBankDepositData,
  UpdateHundiBankDepositData,
  HundiListScope,
  IfscBankDetail,
} from "../hundiTypes"

export const listIncompleteHundis = async (scope: HundiListScope): Promise<IncompleteHundiOption[]> => {
  return getIncompleteHundisForScope(scope)
}

export const getHundiRemaining = async (hundiId: number): Promise<HundiRemaining | null> => {
  return getHundiRemainingById(hundiId)
}

export const listHundiBankDeposits = async (scope: HundiListScope): Promise<HundiBankDepositListItem[]> => {
  return getHundiBankDepositsForScope(scope)
}

export const searchDepositedBy = async (
  templeId: number,
  query: string,
): Promise<DepositedByOption[]> => {
  return searchDepositedByForTemple(templeId, query)
}

export const verifyDepositedByUser = async (userId: number, templeId: number) => {
  return findDepositedByUser(userId, templeId)
}

export const createHundiBankDeposit = async (data: CreateHundiBankDepositData): Promise<number> => {
  return insertHundiBankDeposit(data)
}

export const isTransactionNumberTaken = async (transactionNumber: string, excludeId: number): Promise<boolean> => {
  const match = await findDepositByTransactionNumber(transactionNumber, excludeId)
  return match !== null
}

export const lookupIfsc = async (code: string): Promise<IfscBankDetail | null> => {
  return fetchIfscDetail(code)
}

export const getHundiBankDepositDetail = async (id: number): Promise<HundiBankDepositDetail | null> => {
  return getHundiBankDepositById(id)
}

export const editHundiBankDeposit = async (id: number, data: UpdateHundiBankDepositData): Promise<void> => {
  return updateHundiBankDeposit(id, data)
}

export const removeHundiBankDeposit = async (id: number): Promise<void> => {
  return deleteHundiBankDepositById(id)
}
