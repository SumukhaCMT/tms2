


import type { RootState } from "@/app/store"

/* =========================================================
   ORGANIZATION LIST
========================================================= */

export const selectOrganizations = (
  state: RootState,
) => state.organizations.organizations

/* =========================================================
   SELECTED ORGANIZATION
========================================================= */

export const selectSelectedOrganization = (
  state: RootState,
) => state.organizations.selectedOrganization

/* =========================================================
   PAGINATION
========================================================= */

export const selectOrganizationPagination = (
  state: RootState,
) => state.organizations.pagination

/* =========================================================
   LOADING
========================================================= */

export const selectOrganizationsLoading = (
  state: RootState,
) => state.organizations.loading

export const selectOrganizationDetailsLoading = (
  state: RootState,
) => state.organizations.detailsLoading

/* =========================================================
   SUBMITTING
========================================================= */

export const selectOrganizationSubmitting = (
  state: RootState,
) => state.organizations.submitting

/* =========================================================
   DELETING
========================================================= */

export const selectOrganizationDeleting = (
  state: RootState,
) => state.organizations.deleting

/* =========================================================
   ERROR
========================================================= */

export const selectOrganizationError = (
  state: RootState,
) => state.organizations.error