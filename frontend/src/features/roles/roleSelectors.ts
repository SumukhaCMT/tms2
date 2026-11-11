import type {
  RootState,
} from "@/app/store"


/* =========================================================
   ROLE STATE
========================================================= */

const selectRoleState =
  (
    state: RootState,
  ) =>
    state.roles


/* =========================================================
   ROLES
========================================================= */

export const selectRoles =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).roles


/* =========================================================
   SELECTED ROLE
========================================================= */

export const selectSelectedRole =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).selectedRole


/* =========================================================
   LOADING
========================================================= */

export const selectRolesLoading =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).loading


/* =========================================================
   SAVING
========================================================= */

export const selectRolesSaving =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).saving


/* =========================================================
   DELETING
========================================================= */

export const selectRolesDeleting =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).deleting


/* =========================================================
   ERROR
========================================================= */

export const selectRolesError =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).error


/* =========================================================
   SUCCESS
========================================================= */

export const selectRolesSuccess =
  (
    state: RootState,
  ) =>
    selectRoleState(
      state,
    ).success