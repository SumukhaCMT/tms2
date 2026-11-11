import {
  insertDefineHundi,
  getDefineHundisForScope,
  getDefineHundiById,
  updateDefineHundi,
  deleteDefineHundi,
} from "../repositories/defineHundiRepository"

import type {
  CreateDefineHundiData,
  UpdateDefineHundiData,
  DefineHundi,
  DefineHundiListItem,
  HundiListScope,
} from "../hundiTypes"

export const createDefineHundi = async (data: CreateDefineHundiData): Promise<number> => {
  return insertDefineHundi(data)
}

export const listDefineHundisForScope = async (scope: HundiListScope): Promise<DefineHundiListItem[]> => {
  return getDefineHundisForScope(scope)
}

export const getDefineHundi = async (id: number): Promise<DefineHundi | null> => {
  return getDefineHundiById(id)
}

export const editDefineHundi = async (id: number, data: UpdateDefineHundiData): Promise<void> => {
  return updateDefineHundi(id, data)
}

export const removeDefineHundi = async (id: number): Promise<void> => {
  return deleteDefineHundi(id)
}
