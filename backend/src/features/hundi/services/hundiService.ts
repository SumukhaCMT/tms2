import {
  getDeitiesForTemple,
  getActiveDenominations,
  findDefineHundisForDeities,
  insertHundiBatch,
  getHundisForScope,
  getHundiDetailById,
  deleteHundi,
  setHundiImagePath,
  updateHundiRecord,
  setSignedReceiptPath,
  getTempleName,
  getTemplesForOrganization,
  templeBelongsToOrganization,
  searchWitnesses,
} from "../repositories/hundiRepository"

import type {
  CreateHundiData,
  CreateHundiResultRow,
  UpdateHundiData,
  HundiListItem,
  HundiListScope,
  HundiDetail,
  TempleOption,
  DeityOption,
  DenominationCatalogItem,
  WitnessSuggestion,
} from "../hundiTypes"

export const listTemplesForOrganizationService = async (organizationId: number): Promise<TempleOption[]> => {
  return getTemplesForOrganization(organizationId)
}

export const isTempleInOrganizationService = async (
  templeId: number,
  organizationId: number,
): Promise<boolean> => {
  return templeBelongsToOrganization(templeId, organizationId)
}

export const listDeitiesForTemple = async (
  organizationId: number,
  templeId: number,
): Promise<DeityOption[]> => {
  return getDeitiesForTemple(organizationId, templeId)
}

export const listActiveDenominations = async (): Promise<DenominationCatalogItem[]> => {
  return getActiveDenominations()
}

export interface CreateHundiOutcome {
  created: CreateHundiResultRow[]
  missingDeityIds: number[]
}

export const createHundiBatch = async (
  data: CreateHundiData,
  deityIds: number[],
): Promise<CreateHundiOutcome> => {
  const matches = await findDefineHundisForDeities(data.organization_id, data.temple_id, deityIds)

  const matchedDeityIds = new Set(matches.map((match) => match.deity_id))
  const missingDeityIds = deityIds.filter((deityId) => !matchedDeityIds.has(deityId))

  if (missingDeityIds.length) {
    return { created: [], missingDeityIds }
  }

  const created = await insertHundiBatch(data, matches)

  return { created, missingDeityIds: [] }
}

export const listHundisForScope = async (scope: HundiListScope): Promise<HundiListItem[]> => {
  return getHundisForScope(scope)
}

export const getHundiDetail = async (id: number): Promise<HundiDetail | null> => {
  return getHundiDetailById(id)
}

export const removeHundi = async (id: number): Promise<void> => {
  return deleteHundi(id)
}

export const saveHundiImage = async (hundiIds: number[], fileName: string): Promise<void> => {
  return setHundiImagePath(hundiIds, fileName)
}

export const updateHundi = async (id: number, data: UpdateHundiData): Promise<void> => {
  return updateHundiRecord(id, data)
}

export const saveSignedReceipt = async (id: number, fileName: string): Promise<void> => {
  return setSignedReceiptPath(id, fileName)
}

export const getTempleNameService = async (templeId: number): Promise<string | null> => {
  return getTempleName(templeId)
}

export const searchWitnessSuggestions = async (scope: HundiListScope, query: string): Promise<WitnessSuggestion[]> => {
  return searchWitnesses(scope, query)
}
