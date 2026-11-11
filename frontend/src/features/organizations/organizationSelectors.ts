


import type { RootState } from "@/app/store"



export const selectOrganizations = (
  state: RootState,
) => state.organizations.organizations



export const selectSelectedOrganization = (
  state: RootState,
) => state.organizations.selectedOrganization



export const selectOrganizationPagination = (
  state: RootState,
) => state.organizations.pagination



export const selectOrganizationsLoading = (
  state: RootState,
) => state.organizations.loading

export const selectOrganizationDetailsLoading = (
  state: RootState,
) => state.organizations.detailsLoading



export const selectOrganizationSubmitting = (
  state: RootState,
) => state.organizations.submitting



export const selectOrganizationDeleting = (
  state: RootState,
) => state.organizations.deleting



export const selectOrganizationError = (
  state: RootState,
) => state.organizations.error