import {
  getInventoryItemTypeOptions,
  searchGivenByValues,
  searchInventoryItems,
  insertInventoryBatch,
  getInventoryForScope,
  getInventoryDetailById,
  deleteInventory,
  getInventoryGroupById,
  updateInventoryGroup,
  getTempleName,
  getTemplesForOrganization,
  templeBelongsToOrganization,
} from "../repositories/inventoryRepository"

import type {
  CreateInventoryData,
  CreateInventoryResultRow,
  InventoryBatchData,
  InventoryGroup,
  InventoryListItem,
  InventoryListScope,
  InventoryDetail,
  InventoryItemType,
  GivenBySuggestion,
  InventoryItemSuggestion,
  TempleOption,
} from "../inventoryTypes"

export const listTemplesForOrganizationService = async (organizationId: number): Promise<TempleOption[]> => {
  return getTemplesForOrganization(organizationId)
}

export const isTempleInOrganizationService = async (
  templeId: number,
  organizationId: number,
): Promise<boolean> => {
  return templeBelongsToOrganization(templeId, organizationId)
}

export const listInventoryItemTypes = async (): Promise<InventoryItemType[]> => {
  return getInventoryItemTypeOptions()
}

export const searchGivenBy = async (
  scope: InventoryListScope,
  query: string,
): Promise<GivenBySuggestion[]> => {
  return searchGivenByValues(scope, query)
}

export const searchInventoryItemSuggestions = async (
  scope: InventoryListScope,
  query: string,
): Promise<InventoryItemSuggestion[]> => {
  return searchInventoryItems(scope, query)
}

export const createInventoryBatch = async (data: CreateInventoryData): Promise<CreateInventoryResultRow[]> => {
  return insertInventoryBatch(data)
}

export const listInventoryForScope = async (scope: InventoryListScope): Promise<InventoryListItem[]> => {
  return getInventoryForScope(scope)
}

export const getInventoryDetail = async (id: number): Promise<InventoryDetail | null> => {
  return getInventoryDetailById(id)
}

export const removeInventory = async (id: number): Promise<void> => {
  return deleteInventory(id)
}

export const getInventoryGroup = async (id: number): Promise<InventoryGroup | null> => {
  return getInventoryGroupById(id)
}

export const updateInventoryGroupService = async (
  group: InventoryGroup,
  userId: number,
  data: InventoryBatchData,
): Promise<number> => {
  return updateInventoryGroup(group, userId, data)
}

export const getTempleNameService = async (templeId: number): Promise<string | null> => {
  return getTempleName(templeId)
}
