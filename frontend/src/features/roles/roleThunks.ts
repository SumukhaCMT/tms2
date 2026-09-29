import {
  createAsyncThunk,
} from "@reduxjs/toolkit"

import {
  createRole as createRoleApi,
  deleteRole as deleteRoleApi,
  getRoleById as getRoleByIdApi,
  getRoles as getRolesApi,
  updateRole as updateRoleApi,
} from "./services/roleService"

import type {
  CreateRolePayload,
  RoleDetails,
  Role,
  UpdateRoleRequest,
} from "./roleTypes"


/* =========================================================
   ERROR HELPER
========================================================= */

const getErrorMessage = (
  error: unknown,
): string => {

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {

    const response = (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response

    return (
      response?.data?.message ??
      "Something went wrong"
    )
  }


  if (error instanceof Error) {

    return error.message
  }


  return "Something went wrong"
}


/* =========================================================
   FETCH ROLES
========================================================= */

export const fetchRoles =
  createAsyncThunk<
    Role[],
    void,
    {
      rejectValue: string
    }
  >(
    "roles/fetchRoles",

    async (
      _,
      thunkAPI,
    ) => {

      try {

        const response =
          await getRolesApi()

        return response.data

      } catch (error) {

        return thunkAPI.rejectWithValue(
          getErrorMessage(error),
        )
      }
    },
  )


/* =========================================================
   FETCH ROLE BY ID
========================================================= */

export const fetchRoleById =
  createAsyncThunk<
    RoleDetails,
    number,
    {
      rejectValue: string
    }
  >(
    "roles/fetchRoleById",

    async (
      id,
      thunkAPI,
    ) => {

      try {

        const response =
          await getRoleByIdApi(
            id,
          )

        return response.data

      } catch (error) {

        return thunkAPI.rejectWithValue(
          getErrorMessage(error),
        )
      }
    },
  )


/* =========================================================
   CREATE ROLE
========================================================= */

export const createRole =
  createAsyncThunk<
    RoleDetails,
    CreateRolePayload,
    {
      rejectValue: string
    }
  >(
    "roles/createRole",

    async (
      data,
      thunkAPI,
    ) => {

      try {

        const response =
          await createRoleApi(
            data,
          )

        return response.data

      } catch (error) {

        return thunkAPI.rejectWithValue(
          getErrorMessage(error),
        )
      }
    },
  )


/* =========================================================
   UPDATE ROLE
========================================================= */

export const updateRole =
  createAsyncThunk<
    RoleDetails,
    UpdateRoleRequest,
    {
      rejectValue: string
    }
  >(
    "roles/updateRole",

    async (
      payload,
      thunkAPI,
    ) => {

      try {

        const response =
          await updateRoleApi(
            payload,
          )

        return response.data

      } catch (error) {

        return thunkAPI.rejectWithValue(
          getErrorMessage(error),
        )
      }
    },
  )


/* =========================================================
   DELETE ROLE
========================================================= */

export const deleteRole =
  createAsyncThunk<
    number,
    number,
    {
      rejectValue: string
    }
  >(
    "roles/deleteRole",

    async (
      id,
      thunkAPI,
    ) => {

      try {

        await deleteRoleApi(
          id,
        )

        return id

      } catch (error) {

        return thunkAPI.rejectWithValue(
          getErrorMessage(error),
        )
      }
    },
  )