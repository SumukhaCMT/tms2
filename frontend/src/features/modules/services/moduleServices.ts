

import api from "@/axios/axios"

import type {
  CreateModulePayload,
  Module,
  ModulesResponse,
  UpdateModulePayload,
} from "../moduleTypes"

/* -------------------------------------------------------------------------- */
/* Get Modules                                                                */
/* -------------------------------------------------------------------------- */
export const getModulesList = async (): Promise<Module[]> => {
  const response = await api.get("/v1/moduleslist")

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  if (Array.isArray(response.data?.modules)) {
    return response.data.modules
  }

  return []
}
export const getModules = async (
  page = 1,
  limit = 10
): Promise<ModulesResponse> => {
  const response = await api.get<ModulesResponse>(
    `/v1/modules?page=${page}&limit=${limit}`
  )

  return response.data
}

/* -------------------------------------------------------------------------- */
/* Get Module By ID                                                           */
/* -------------------------------------------------------------------------- */

export const getModuleById = async (
  id: number | string
): Promise<Module> => {
  const response = await api.get(`/v1/modules/${id}`)

  return (
    response.data?.data ??
    response.data?.module ??
    response.data
  )
}

/* -------------------------------------------------------------------------- */
/* Create Module                                                              */
/* -------------------------------------------------------------------------- */

export const createModule = async (
  data: CreateModulePayload
): Promise<Module> => {
  const response = await api.post(
    "/v1/modules",
    data
  )

  return (
    response.data?.data ??
    response.data?.module ??
    response.data
  )
}

/* -------------------------------------------------------------------------- */
/* Update Module                                                              */
/* -------------------------------------------------------------------------- */

export const updateModule = async (
  data: UpdateModulePayload
): Promise<Module> => {
  const response = await api.put(
    `/v1/modules/${data.id}`,
    data
  )

  return (
    response.data?.data ??
    response.data?.module ??
    response.data
  )
}

/* -------------------------------------------------------------------------- */
/* Delete Module                                                              */
/* -------------------------------------------------------------------------- */

export const deleteModule = async (
  id: number
): Promise<void> => {
  await api.delete(`/v1/modules/${id}`)
}