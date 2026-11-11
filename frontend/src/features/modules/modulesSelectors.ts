

import type { RootState } from "@/app/store"



export const selectModules = (
  state: RootState
) => state.modules.modules



export const selectModulesPagination = (
  state: RootState
) => state.modules.pagination



export const selectModulesLoading = (
  state: RootState
) => state.modules.loading



export const selectModulesError = (
  state: RootState
) => state.modules.error



export const selectModulesSuccess = (
  state: RootState
) => state.modules.success