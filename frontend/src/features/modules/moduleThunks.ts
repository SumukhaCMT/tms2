

import { createAsyncThunk } from "@reduxjs/toolkit"

import {
   getModulesList,
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "./services/moduleServices"

import type {
    Module,
  CreateModulePayload,
  UpdateModulePayload,
} from "./moduleTypes"

/* -------------------------------------------------------------------------- */
/* Error Types                                                                */
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
      apiError.response?.data?.message ||
      apiError.message ||
      fallback
    )
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}


export const fetchModulesList = createAsyncThunk<
  Module[],
  void,
  { rejectValue: string }
>(
  "modules/fetchModulesList",
  async (_, { rejectWithValue }) => {
    try {
      return await getModulesList()
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch modules."
        )
      )
    }
  }
)
/* -------------------------------------------------------------------------- */
/* Fetch Modules                                                              */
/* -------------------------------------------------------------------------- */

export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
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
      return await getModules(page, limit)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch modules."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* Fetch Module By ID                                                         */
/* -------------------------------------------------------------------------- */

export const fetchModuleById = createAsyncThunk(
  "modules/fetchModuleById",
  async (
    id: number | string,
    { rejectWithValue }
  ) => {
    try {
      return await getModuleById(id)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch module."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* Create Module                                                              */
/* -------------------------------------------------------------------------- */

export const addModule = createAsyncThunk(
  "modules/addModule",
  async (
    data: CreateModulePayload,
    { rejectWithValue }
  ) => {
    try {
      return await createModule(data)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create module."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* Update Module                                                              */
/* -------------------------------------------------------------------------- */

export const editModule = createAsyncThunk(
  "modules/editModule",
  async (
    data: UpdateModulePayload,
    { rejectWithValue }
  ) => {
    try {
      return await updateModule(data)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update module."
        )
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* Delete Module                                                              */
/* -------------------------------------------------------------------------- */

export const removeModule = createAsyncThunk(
  "modules/removeModule",
  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      await deleteModule(id)

      return id
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete module."
        )
      )
    }
  }
)