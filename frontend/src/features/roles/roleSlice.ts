import {
  createSlice,
} from "@reduxjs/toolkit"

import type {
  RoleState,
} from "./roleTypes"

import {
  createRole,
  deleteRole,
  fetchRoleById,
  fetchRoles,
  updateRole,
} from "./roleThunks"


/* =========================================================
   INITIAL STATE
========================================================= */

const initialState:
  RoleState = {

    roles: [],

    selectedRole: null,

    loading: false,

    saving: false,

    deleting: false,

    error: null,

    success: null,

  }


/* =========================================================
   SLICE
========================================================= */

const roleSlice =
  createSlice({

    name: "roles",

    initialState,

    reducers: {

      clearRoleError: (
        state,
      ) => {

        state.error = null
      },


      clearRoleSuccess: (
        state,
      ) => {

        state.success = null
      },


      clearSelectedRole: (
        state,
      ) => {

        state.selectedRole = null
      },

    },


    extraReducers: (
      builder,
    ) => {

      /* ================================================
         FETCH ROLES
      ================================================ */

      builder

        .addCase(
          fetchRoles.pending,
          (
            state,
          ) => {

            state.loading = true

            state.error = null

          },
        )

        .addCase(
          fetchRoles.fulfilled,
          (
            state,
            action,
          ) => {

            state.loading = false

            state.roles =
              action.payload

          },
        )

        .addCase(
          fetchRoles.rejected,
          (
            state,
            action,
          ) => {

            state.loading = false

            state.error =
              action.payload ??
              "Failed to load roles"

          },
        )


      /* ================================================
         FETCH ROLE
      ================================================ */

      builder

        .addCase(
          fetchRoleById.pending,
          (
            state,
          ) => {

            state.loading = true

            state.error = null

          },
        )

        .addCase(
          fetchRoleById.fulfilled,
          (
            state,
            action,
          ) => {

            state.loading = false

            state.selectedRole =
              action.payload

          },
        )

        .addCase(
          fetchRoleById.rejected,
          (
            state,
            action,
          ) => {

            state.loading = false

            state.selectedRole =
              null

            state.error =
              action.payload ??
              "Failed to load role"

          },
        )


      /* ================================================
         CREATE ROLE
      ================================================ */

      builder

        .addCase(
          createRole.pending,
          (
            state,
          ) => {

            state.saving = true

            state.error = null

            state.success = null

          },
        )

        .addCase(
          createRole.fulfilled,
          (
            state,
            action,
          ) => {

            state.saving = false

            state.success =
              "Role created successfully"

            state.roles.push(
              action.payload,
            )

          },
        )

        .addCase(
          createRole.rejected,
          (
            state,
            action,
          ) => {

            state.saving = false

            state.error =
              action.payload ??
              "Failed to create role"

          },
        )


      /* ================================================
         UPDATE ROLE
      ================================================ */

      builder

        .addCase(
          updateRole.pending,
          (
            state,
          ) => {

            state.saving = true

            state.error = null

            state.success = null

          },
        )

        .addCase(
          updateRole.fulfilled,
          (
            state,
            action,
          ) => {

            state.saving = false

            state.success =
              "Role updated successfully"


            const index =
              state.roles.findIndex(
                (
                  role,
                ) =>
                  role.id ===
                  action.payload.id,
              )


            if (
              index !== -1
            ) {

              state.roles[index] =
                action.payload

            }


            state.selectedRole =
              action.payload

          },
        )

        .addCase(
          updateRole.rejected,
          (
            state,
            action,
          ) => {

            state.saving = false

            state.error =
              action.payload ??
              "Failed to update role"

          },
        )


      /* ================================================
         DELETE ROLE
      ================================================ */

      builder

        .addCase(
          deleteRole.pending,
          (
            state,
          ) => {

            state.deleting = true

            state.error = null

            state.success = null

          },
        )

        .addCase(
          deleteRole.fulfilled,
          (
            state,
            action,
          ) => {

            state.deleting = false

            state.success =
              "Role deleted successfully"


            state.roles =
              state.roles.filter(
                (
                  role,
                ) =>
                  role.id !==
                  action.payload,
              )


            if (
              state.selectedRole?.id ===
              action.payload
            ) {

              state.selectedRole =
                null

            }

          },
        )

        .addCase(
          deleteRole.rejected,
          (
            state,
            action,
          ) => {

            state.deleting = false

            state.error =
              action.payload ??
              "Failed to delete role"

          },
        )

    },

  })


/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearRoleError,
  clearRoleSuccess,
  clearSelectedRole,
} =
  roleSlice.actions


/* =========================================================
   REDUCER
========================================================= */

export default roleSlice.reducer