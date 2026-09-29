import api from "@/axios/axios"

import type {
  CreateRolePayload,
  RoleResponse,
  RolesResponse,
  UpdateRoleRequest,
} from "../roleTypes"


/* =========================================================
   GET ROLES
========================================================= */

export const getRoles =
  async (): Promise<RolesResponse> => {

    const response =
      await api.get<RolesResponse>(
        "/v1/roles",
      )

    return response.data
  }


/* =========================================================
   GET ROLE BY ID
========================================================= */

export const getRoleById =
  async (
    id: number,
  ): Promise<RoleResponse> => {

    const response =
      await api.get<RoleResponse>(
        `/v1/roles/${id}`,
      )

    return response.data
  }


/* =========================================================
   CREATE ROLE
========================================================= */

export const createRole =
  async (
    data: CreateRolePayload,
  ): Promise<RoleResponse> => {

    const response =
      await api.post<RoleResponse>(
        "/v1/roles",
        data,
      )

    return response.data
  }


/* =========================================================
   UPDATE ROLE
========================================================= */

export const updateRole =
  async ({
    id,
    data,
  }: UpdateRoleRequest): Promise<RoleResponse> => {

    const response =
      await api.put<RoleResponse>(
        `/v1/roles/${id}`,
        data,
      )

    return response.data
  }


/* =========================================================
   DELETE ROLE
========================================================= */

export const deleteRole =
  async (
    id: number,
  ): Promise<{
    success: boolean
    message: string
  }> => {

    const response =
      await api.delete(
        `/v1/roles/${id}`,
      )

    return response.data
  }