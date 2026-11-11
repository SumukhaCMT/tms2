import { createAsyncThunk } from "@reduxjs/toolkit"

import type {
  CreateSystemDefaultPayload,
  SystemDefaultListParams,
  UpdateSystemDefaultPayload,
} from "./systemDefaultsTypes"

import { systemDefaultsService } from "./services/systemDefaultsService"

export const fetchSystemDefaults =
  createAsyncThunk(
    "systemDefaults/fetchSystemDefaults",
    async (
      params: SystemDefaultListParams | undefined,
      { rejectWithValue },
    ) => {
      try {
        return await systemDefaultsService.getSystemDefaults(
          params,
        )
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Failed to fetch system defaults",
        )
      }
    },
  )

export const fetchSystemDefaultById =
  createAsyncThunk(
    "systemDefaults/fetchSystemDefaultById",
    async (
      id: number,
      { rejectWithValue },
    ) => {
      try {
        return await systemDefaultsService.getSystemDefaultById(
          id,
        )
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Failed to fetch system default",
        )
      }
    },
  )

export const createSystemDefault =
  createAsyncThunk(
    "systemDefaults/createSystemDefault",
    async (
      data: CreateSystemDefaultPayload,
      { dispatch, rejectWithValue },
    ) => {
      try {
        const response =
          await systemDefaultsService.createSystemDefault(
            data,
          )

        await dispatch(
          fetchSystemDefaults(),
        )

        return response
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Failed to create system default",
        )
      }
    },
  )

export const updateSystemDefault =
  createAsyncThunk(
    "systemDefaults/updateSystemDefault",
    async (
      payload: {
        id: number
        data: UpdateSystemDefaultPayload
      },
      { dispatch, rejectWithValue },
    ) => {
      try {
        const response =
          await systemDefaultsService.updateSystemDefault(
            payload.id,
            payload.data,
          )

        await dispatch(
          fetchSystemDefaults(),
        )

        return response
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Failed to update system default",
        )
      }
    },
  )

export const deleteSystemDefault =
  createAsyncThunk(
    "systemDefaults/deleteSystemDefault",
    async (
      id: number,
      { dispatch, rejectWithValue },
    ) => {
      try {
        const response =
          await systemDefaultsService.deleteSystemDefault(
            id,
          )

        await dispatch(
          fetchSystemDefaults(),
        )

        return response
      } catch (error) {
        return rejectWithValue(
          error instanceof Error
            ? error.message
            : "Failed to delete system default",
        )
      }
    },
  )