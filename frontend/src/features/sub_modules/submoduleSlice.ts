import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"

import type {
  SubModule,
  SubModulesResponse,
  SubModulesState,
} from "./submoduleTypes"

import {
 
  fetchSubModules,
  fetchSubModuleById,
  addSubModule,
  editSubModule,
  removeSubModule,
} from "./submoduleThunks"

/* -------------------------------------------------------------------------- */
/* INITIAL STATE                                                              */
/* -------------------------------------------------------------------------- */

const initialState: SubModulesState = {
  modules: [],

  selectedModule: null,

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
/* SLICE                                                                      */
/* -------------------------------------------------------------------------- */

const submoduleSlice = createSlice({
  name: "submodules",

  initialState,

  reducers: {
    clearSubModuleError: (state) => {
      state.error = null
    },

    clearSubModuleSuccess: (state) => {
      state.success = false
    },

    clearSelectedSubModule: (state) => {
      state.selectedModule = null
    },

    clearSubModules: (state) => {
      state.modules = []

      state.selectedModule = null

      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    },
  },

  extraReducers: (builder) => {

    /* ====================================================================== */
    /* GET ALL                                                                */
    /* ====================================================================== */

    builder
      .addCase(
        fetchSubModules.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
        fetchSubModules.fulfilled,
        (
          state,
          action: PayloadAction<SubModulesResponse>
        ) => {
          state.loading = false

          state.modules =
            action.payload.data

          if (action.payload.pagination) {
            state.pagination =
              action.payload.pagination
          }
        }
      )

      .addCase(
        fetchSubModules.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch sub modules."
        }
      )

    /* ====================================================================== */
    /* GET BY ID                                                              */
    /* ====================================================================== */

    builder
      .addCase(
        fetchSubModuleById.pending,
        (state) => {
          state.loading = true
          state.error = null
        }
      )

      .addCase(
        fetchSubModuleById.fulfilled,
        (
          state,
          action: PayloadAction<SubModule>
        ) => {
          state.loading = false

          state.selectedModule =
            action.payload
        }
      )

      .addCase(
        fetchSubModuleById.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ??
            "Failed to fetch sub module."
        }
      )

    /* ====================================================================== */
    /* CREATE                                                                 */
    /* ====================================================================== */

    builder
      .addCase(
        addSubModule.pending,
        (state) => {
          state.loading = true
          state.error = null
          state.success = false
        }
      )

      .addCase(
        addSubModule.fulfilled,
        (
          state,
          action: PayloadAction<SubModule>
        ) => {
          state.loading = false

          state.success = true

          state.modules.push(
            action.payload
          )

          state.selectedModule =
            action.payload

          state.pagination.total += 1

          state.pagination.totalPages =
            Math.ceil(
              state.pagination.total /
                state.pagination.limit
            )
        }
      )

      .addCase(
        addSubModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ??
            "Failed to create sub module."
        }
      )

    /* ====================================================================== */
    /* UPDATE                                                                 */
    /* ====================================================================== */

    builder
      .addCase(
        editSubModule.pending,
        (state) => {
          state.loading = true
          state.error = null
          state.success = false
        }
      )

      .addCase(
        editSubModule.fulfilled,
        (
          state,
          action: PayloadAction<SubModule>
        ) => {
          state.loading = false

          state.success = true

          const index =
            state.modules.findIndex(
              (subModule) =>
                subModule.id ===
                action.payload.id
            )

          if (index !== -1) {
            state.modules[index] =
              action.payload
          }

          state.selectedModule =
            action.payload
        }
      )

      .addCase(
        editSubModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ??
            "Failed to update sub module."
        }
      )

    /* ====================================================================== */
    /* DELETE                                                                 */
    /* ====================================================================== */

    builder
      .addCase(
        removeSubModule.pending,
        (state) => {
          state.loading = true
          state.error = null
          state.success = false
        }
      )

      .addCase(
        removeSubModule.fulfilled,
        (
          state,
          action: PayloadAction<number>
        ) => {
          state.loading = false

          state.success = true

          state.modules =
            state.modules.filter(
              (subModule) =>
                subModule.id !==
                action.payload
            )

          if (
            state.selectedModule?.id ===
            action.payload
          ) {
            state.selectedModule = null
          }

          state.pagination.total =
            Math.max(
              0,
              state.pagination.total - 1
            )

          state.pagination.totalPages =
            state.pagination.total === 0
              ? 0
              : Math.ceil(
                  state.pagination.total /
                    state.pagination.limit
                )
        }
      )

      .addCase(
        removeSubModule.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            (action.payload as string) ??
            "Failed to delete sub module."
        }
      )
  },
})

/* -------------------------------------------------------------------------- */
/* ACTIONS                                                                    */
/* -------------------------------------------------------------------------- */

export const {
  clearSubModuleError,
  clearSubModuleSuccess,
  clearSelectedSubModule,
  clearSubModules,
} = submoduleSlice.actions

/* -------------------------------------------------------------------------- */
/* REDUCER                                                                    */
/* -------------------------------------------------------------------------- */

export default submoduleSlice.reducer