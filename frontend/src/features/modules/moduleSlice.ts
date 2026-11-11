
import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"

import type {
  Module,
  ModulesResponse,
  ModulesState,
} from "./moduleTypes"

import {
  fetchModules,
   fetchModulesList,
  fetchModuleById,
  addModule,
  editModule,
  removeModule,
} from "./moduleThunks"

/* -------------------------------------------------------------------------- */
/* Initial State                                                              */
/* -------------------------------------------------------------------------- */

const initialState: ModulesState = {
  modules: [],

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: false,
  error: null,
  success: false,
}

/* -------------------------------------------------------------------------- */
/* Module Slice                                                               */
/* -------------------------------------------------------------------------- */

const moduleSlice = createSlice({
  name: "modules",

  initialState,

  reducers: {
    clearModuleError: (state) => {
      state.error = null
    },

    clearModuleSuccess: (state) => {
      state.success = false
    },

    clearModules: (state) => {
      state.modules = []

      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    },
  },

  extraReducers: (builder) => {
    /* ---------------------------------------------------------------------- */
    /* Fetch Modules - Existing API                                           */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
        fetchModules.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
        fetchModules.fulfilled,
        (
          state,
          action: PayloadAction<ModulesResponse>
        ) => {
          state.loading = false

          state.modules =
            action.payload.data

          state.pagination =
            action.payload.pagination
        }
      )

      .addCase(
        fetchModules.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to fetch modules."
        }
      )

    /* ---------------------------------------------------------------------- */
    /* Fetch Modules List - NO Pagination                                     */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
      fetchModulesList.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
      fetchModulesList.fulfilled,
        (
          state,
          action: PayloadAction<Module[]>
        ) => {
          state.loading = false

          state.modules =
            action.payload
        }
      )

      .addCase(
        fetchModulesList.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to fetch modules."
        }
      )

    /* ---------------------------------------------------------------------- */
    /* Fetch Module By ID                                                     */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
        fetchModuleById.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
        fetchModuleById.fulfilled,
        (state) => {
          state.loading = false
        }
      )

      .addCase(
        fetchModuleById.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to fetch module."
        }
      )

    /* ---------------------------------------------------------------------- */
    /* Add Module                                                             */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
        addModule.pending,
        (state) => {
          state.loading = true
          state.error = null
          state.success = false
        }
      )

      .addCase(
        addModule.fulfilled,
        (
          state,
          action: PayloadAction<Module>
        ) => {
          state.loading = false
          state.success = true

          state.modules.push(
            action.payload
          )
        }
      )

      .addCase(
        addModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to create module."
        }
      )

    /* ---------------------------------------------------------------------- */
    /* Edit Module                                                            */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
        editModule.pending,
        (state) => {
          state.loading = true
          state.error = null
          state.success = false
        }
      )

      .addCase(
        editModule.fulfilled,
        (
          state,
          action: PayloadAction<Module>
        ) => {
          state.loading = false
          state.success = true

          const index =
            state.modules.findIndex(
              (module) =>
                module.id ===
                action.payload.id
            )

          if (index !== -1) {
            state.modules[index] =
              action.payload
          }
        }
      )

      .addCase(
        editModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to update module."
        }
      )

    /* ---------------------------------------------------------------------- */
    /* Delete Module                                                          */
    /* ---------------------------------------------------------------------- */

    builder
      .addCase(
        removeModule.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
        removeModule.fulfilled,
        (state, action) => {
          state.loading = false

          state.modules =
            state.modules.filter(
              (module) =>
                module.id !==
                action.payload
            )

          if (state.pagination.total > 0) {
            state.pagination.total -= 1

            state.pagination.totalPages =
              Math.ceil(
                state.pagination.total /
                  state.pagination.limit
              )
          }
        }
      )

      .addCase(
        removeModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ||
            "Failed to delete module."
        }
      )
  },
})

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const {
  clearModuleError,
  clearModuleSuccess,
  clearModules,
} = moduleSlice.actions

/* -------------------------------------------------------------------------- */
/* Reducer                                                                    */
/* -------------------------------------------------------------------------- */

export default moduleSlice.reducer
