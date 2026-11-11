import {
  createSlice,
  
} from "@reduxjs/toolkit"

import {
  createSystemDefault,
  deleteSystemDefault,
  fetchSystemDefaultById,
  fetchSystemDefaults,
  updateSystemDefault,
} from "./systemDefaultsThunks"

import type { SystemDefault } from "./systemDefaultsTypes"

interface SystemDefaultsState {
  systemDefaults: SystemDefault[]
  selectedSystemDefault: SystemDefault | null

  loading: boolean
  saving: boolean
  error: string | null

  page: number
  limit: number
  total: number
  totalPages: number
}

const initialState: SystemDefaultsState = {
  systemDefaults: [],
  selectedSystemDefault: null,

  loading: false,
  saving: false,
  error: null,

  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const systemDefaultsSlice =
  createSlice({
    name: "systemDefaults",

    initialState,

    reducers: {
      clearSystemDefaultsError: (
        state,
      ) => {
        state.error = null
      },

      clearSelectedSystemDefault: (
        state,
      ) => {
        state.selectedSystemDefault =
          null
      },
    },

    extraReducers: (builder) => {
      builder

        // =========================================
        // GET ALL
        // =========================================
        .addCase(
          fetchSystemDefaults.pending,
          (state) => {
            state.loading = true
            state.error = null
          },
        )

        .addCase(
          fetchSystemDefaults.fulfilled,
          (state, action) => {
            state.loading = false

            state.systemDefaults =
              action.payload.data

            state.page =
              action.payload.pagination?.page ??
              1

            state.limit =
              action.payload.pagination?.limit ??
              10

            state.total =
              action.payload.pagination?.total ??
              action.payload.data.length

            state.totalPages =
              action.payload.pagination
                ?.totalPages ?? 1
          },
        )

        .addCase(
          fetchSystemDefaults.rejected,
          (state, action) => {
            state.loading = false

            state.error =
              (action.payload as string) ??
              "Failed to fetch system defaults"
          },
        )

        // =========================================
        // GET BY ID
        // =========================================
        .addCase(
          fetchSystemDefaultById.pending,
          (state) => {
            state.loading = true
            state.error = null
          },
        )

        .addCase(
          fetchSystemDefaultById.fulfilled,
          (state, action) => {
            state.loading = false

            state.selectedSystemDefault =
              action.payload.data
          },
        )

        .addCase(
          fetchSystemDefaultById.rejected,
          (state, action) => {
            state.loading = false

            state.error =
              (action.payload as string) ??
              "Failed to fetch system default"
          },
        )

        // =========================================
        // CREATE
        // =========================================
        .addCase(
          createSystemDefault.pending,
          (state) => {
            state.saving = true
            state.error = null
          },
        )

        .addCase(
          createSystemDefault.fulfilled,
          (state) => {
            state.saving = false
          },
        )

        .addCase(
          createSystemDefault.rejected,
          (state, action) => {
            state.saving = false

            state.error =
              (action.payload as string) ??
              "Failed to create system default"
          },
        )

        // =========================================
        // UPDATE
        // =========================================
        .addCase(
          updateSystemDefault.pending,
          (state) => {
            state.saving = true
            state.error = null
          },
        )

        .addCase(
          updateSystemDefault.fulfilled,
          (state) => {
            state.saving = false
          },
        )

        .addCase(
          updateSystemDefault.rejected,
          (state, action) => {
            state.saving = false

            state.error =
              (action.payload as string) ??
              "Failed to update system default"
          },
        )

        // =========================================
        // DELETE
        // =========================================
        .addCase(
          deleteSystemDefault.pending,
          (state) => {
            state.saving = true
            state.error = null
          },
        )

        .addCase(
          deleteSystemDefault.fulfilled,
          (state) => {
            state.saving = false
          },
        )

        .addCase(
          deleteSystemDefault.rejected,
          (state, action) => {
            state.saving = false

            state.error =
              (action.payload as string) ??
              "Failed to delete system default"
          },
        )
    },
  })

export const {
  clearSystemDefaultsError,
  clearSelectedSystemDefault,
} = systemDefaultsSlice.actions

export default systemDefaultsSlice.reducer