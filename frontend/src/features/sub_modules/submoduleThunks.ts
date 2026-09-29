import { createAsyncThunk } from "@reduxjs/toolkit"

import {
  getSubModules,
  getSubModuleById,
  createSubModule,
  updateSubModule,
  deleteSubModule,
} from "./services/submoduleService" 

import type {
  CreateSubModulePayload,
  UpdateSubModulePayload,
} from "./submoduleTypes"

/* -------------------------------------------------------------------------- */
/* API ERROR TYPES                                                            */
/* -------------------------------------------------------------------------- */

interface ApiErrorResponse {
  message?: string
}

interface ApiError {
  response?: {
    status?: number
    data?: ApiErrorResponse
  }
  message?: string
}

/* -------------------------------------------------------------------------- */
/* ERROR MESSAGE                                                              */
/* -------------------------------------------------------------------------- */

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const apiError = error as ApiError

    if (apiError.response?.status === 429) {
      return "Too many requests. Please wait a moment and try again."
    }

    return (
      apiError.response?.data?.message ??
      apiError.message ??
      fallback
    )
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

/* -------------------------------------------------------------------------- */
/* GET ALL                                                                    */
/* -------------------------------------------------------------------------- */
//page limi

export const fetchSubModules = createAsyncThunk(
  "submodules/fetchSubModules",
  async (
    {
      page = 1,
      limit = 10,
    }: {
      page?: number
      limit?: number
    } = {},
    { rejectWithValue }
  ) => {
    try {
      return await getSubModules(
        page,
        limit
      )
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch sub modules."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* GET BY ID                                                                  */
/* -------------------------------------------------------------------------- */

export const fetchSubModuleById =
  createAsyncThunk(
    "submodules/fetchSubModuleById",
    async (
      id: number | string,
      { rejectWithValue }
    ) => {
      try {
        return await getSubModuleById(id)
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch sub module."
          )
        )
      }
    }
  )

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

export const addSubModule = createAsyncThunk(
  "submodules/addSubModule",
  async (
    data: CreateSubModulePayload,
    { rejectWithValue }
  ) => {
    try {
      return await createSubModule(data)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create sub module."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

export const editSubModule = createAsyncThunk(
  "submodules/editSubModule",
  async (
    data: UpdateSubModulePayload,
    { rejectWithValue }
  ) => {
    try {
      return await updateSubModule(data)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update sub module."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

export const removeSubModule = createAsyncThunk(
  "submodules/removeSubModule",
  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      await deleteSubModule(id)

      return id
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete sub module."
        )
      )
    }
  }
)