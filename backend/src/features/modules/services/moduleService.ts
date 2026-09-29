import {
  getModulesList,
  getModules,
    getModuleById,
  insertModule,
    updateModule,
  softDeleteModule,
  getModulesWithSubModules,
  type ModuleWithSubModuleRow,
} from "../repositories/moduleRepository"

import type {
  CreateModuleData,
   UpdateModuleData,
} from "../modulesTypes"

// ============================
// Get Modules
// ===============================

export const fetchModulesList = async () => {
  return getModulesList()
}

//rate limit pagination
export const fetchModules = async (
  limit: number,
  offset: number,
) => {
  return getModules(limit, offset)
}

export const fetchModuleById = async (
  id: number,
) => {
  return getModuleById(id)
}
// ============================
// Create Module
// ============================

export const createModule = async (
  data: CreateModuleData,
) => {
  return insertModule(data)
}


// ============================
// Update Module
// ============================

export const editModule = async (
  id: number,
  data: UpdateModuleData,
) => {
  return updateModule(id, data)
}

// ============================
// Soft Delete Module
// ============================

export const deleteModule = async (
  id: number,
) => {
  return softDeleteModule(id)
}

// ============================
// Get Modules With Sub-Modules (for sidebar nav)
// ============================

export interface SidebarSubModule {
  id: number
  code: string
  name: string
}

export interface SidebarModule {
  id: number
  code: string
  name: string
  subModules: SidebarSubModule[]
}

export const fetchModulesWithSubModules = async (): Promise<
  SidebarModule[]
> => {
  const rows: ModuleWithSubModuleRow[] = await getModulesWithSubModules()

  const moduleMap = new Map<number, SidebarModule>()

  for (const row of rows) {
    if (!moduleMap.has(row.module_id)) {
      moduleMap.set(row.module_id, {
        id: row.module_id,
        code: row.module_code,
        name: row.module_name,
        subModules: [],
      })
    }

    moduleMap.get(row.module_id)!.subModules.push({
      id: row.sub_module_id,
      code: row.sub_module_code,
      name: row.sub_module_name,
    })
  }

  return Array.from(moduleMap.values())
}
