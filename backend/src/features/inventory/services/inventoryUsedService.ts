import {
  getInventoryItemOptionsForScope,
  getInventoryStockSummaryById,
  isUsedTransactionNumberTaken,
  insertInventoryUsed,
  getInventoryUsedForScope,
  getInventoryUsedDetailById,
  updateInventoryUsedRecord,
  deleteInventoryUsedRecord,
  getInventoryUsageHistoryByItemId,
} from "../repositories/inventoryUsedRepository"

import type {
  InventoryListScope,
  InventoryItemOption,
  InventoryStockSummary,
  InventoryUsedListItem,
  InventoryUsedDetail,
  InventoryUsageHistoryItem,
  CreateInventoryUsedData,
  UpdateInventoryUsedData,
} from "../inventoryTypes"

export const listInventoryItemOptionsService = async (scope: InventoryListScope): Promise<InventoryItemOption[]> => {
  return getInventoryItemOptionsForScope(scope)
}

export const getInventoryStockSummaryService = async (
  itemId: number,
  excludeUsedId: number,
): Promise<InventoryStockSummary | null> => {
  return getInventoryStockSummaryById(itemId, excludeUsedId)
}

const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const randomAlphanumeric = (length: number): string => {
  let value = ""
  for (let i = 0; i < length; i += 1) {
    value += ALPHANUMERIC_CHARS[Math.floor(Math.random() * ALPHANUMERIC_CHARS.length)]
  }
  return value
}

export const generateUniqueTransactionNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `INV-${Date.now().toString(36).toUpperCase()}-${randomAlphanumeric(4)}`
    const taken = await isUsedTransactionNumberTaken(candidate)
    if (!taken) {
      return candidate
    }
  }
  return `INV-${Date.now().toString(36).toUpperCase()}-${randomAlphanumeric(8)}`
}

export const createInventoryUsed = async (data: CreateInventoryUsedData): Promise<{ id: number; transaction_number: string }> => {
  const transactionNumber = await generateUniqueTransactionNumber()
  const id = await insertInventoryUsed(data, transactionNumber)
  return { id, transaction_number: transactionNumber }
}

export const listInventoryUsedForScope = async (scope: InventoryListScope): Promise<InventoryUsedListItem[]> => {
  return getInventoryUsedForScope(scope)
}

export const getInventoryUsedDetail = async (id: number): Promise<InventoryUsedDetail | null> => {
  return getInventoryUsedDetailById(id)
}

export const updateInventoryUsed = async (id: number, data: UpdateInventoryUsedData): Promise<void> => {
  return updateInventoryUsedRecord(id, data)
}

export const removeInventoryUsed = async (id: number): Promise<void> => {
  return deleteInventoryUsedRecord(id)
}

export const listInventoryUsageHistory = async (itemId: number): Promise<InventoryUsageHistoryItem[]> => {
  return getInventoryUsageHistoryByItemId(itemId)
}
