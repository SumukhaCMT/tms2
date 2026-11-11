import type { RootState } from "@/app/store"

export const selectSystemDefaultsState = (
  state: RootState,
) => state.systemDefaults

export const selectSystemDefaults = (
  state: RootState,
) =>
  state.systemDefaults.systemDefaults

export const selectSelectedSystemDefault = (
  state: RootState,
) =>
  state.systemDefaults.selectedSystemDefault

export const selectSystemDefaultsLoading = (
  state: RootState,
) =>
  state.systemDefaults.loading

export const selectSystemDefaultsSaving = (
  state: RootState,
) =>
  state.systemDefaults.saving

export const selectSystemDefaultsError = (
  state: RootState,
) =>
  state.systemDefaults.error

export const selectSystemDefaultsPagination = (
  state: RootState,
) => ({
  page: state.systemDefaults.page,
  limit: state.systemDefaults.limit,
  total: state.systemDefaults.total,
  totalPages:
    state.systemDefaults.totalPages,
})