import { clearCache } from "../../../utils/cache"
import {
  createSubModule,
  deleteSubModule,
  findSubModuleById,
  findSubModules,
  getConnection,
  updateSubModule,
} from "../repositories/subModuleRepository"

import {
  createDefaultPermissions,
  deleteBySubModuleId,
  findBySubModuleId,
  findBySubModuleIds,
} from "../repositories/defaultPermissionRepository"

import type {
  CreateSubModuleRequest,
  SubModuleWithPermissions,
    
} from "../subModuleTypes"

export const create = async (
  data: CreateSubModuleRequest,
): Promise<SubModuleWithPermissions> => {
  const connection = await getConnection()

  try {
    await connection.beginTransaction()

    const subModuleId = await createSubModule(connection, data)

    await createDefaultPermissions(
      connection,
      subModuleId,
      data.permissions,
    )

    await connection.commit()
    clearCache("modules:")

    const subModule = await findSubModuleById(subModuleId)
    const permissions = await findBySubModuleId(subModuleId)

    if (!subModule) {
      throw new Error("Sub module could not be retrieved after creation")
    }

    return {
      ...subModule,
      permissions: permissions.map((item) => ({
        role_id: item.role_id,
        permission: item.permission,
      })),
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}



export const getAll = async (
  moduleId?: number,
  search = "",
): Promise<SubModuleWithPermissions[]> => {
  const subModules = await findSubModules(moduleId, search)

  const permissions = await findBySubModuleIds(
    subModules.map((subModule) => subModule.id),
  )

  return subModules.map((subModule) => ({
    ...subModule,
    permissions: permissions
      .filter((item) => item.sub_module_id === subModule.id)
      .map((item) => ({
        role_id: item.role_id,
        permission: item.permission,
      })),
  }))
}




export const getById = async (
  id: number,
): Promise<SubModuleWithPermissions> => {
  const subModule = await findSubModuleById(id)

  if (!subModule) {
    throw new Error("Sub module not found")
  }

  const permissions = await findBySubModuleId(id)

  return {
    ...subModule,
    permissions: permissions.map((item) => ({
      role_id: item.role_id,
      permission: item.permission,
    })),
  }
}

export const update = async (
  id: number,
  data: CreateSubModuleRequest,
): Promise<SubModuleWithPermissions> => {
  const connection = await getConnection()

  try {
    await connection.beginTransaction()

    const existing = await findSubModuleById(id)

    if (!existing) {
      throw new Error("Sub module not found")
    }

    await updateSubModule(connection, id, data)

    await deleteBySubModuleId(connection, id)

    await createDefaultPermissions(
      connection,
      id,
      data.permissions,
    )

    await connection.commit()
    clearCache("modules:")

    return getById(id)
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const remove = async (id: number): Promise<void> => {
  const connection = await getConnection()

  try {
    await connection.beginTransaction()

    const existing = await findSubModuleById(id)

    if (!existing) {
      throw new Error("Sub module not found")
    }

    await deleteBySubModuleId(connection, id)
    await deleteSubModule(connection, id)

    await connection.commit()
    clearCache("modules:")
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}