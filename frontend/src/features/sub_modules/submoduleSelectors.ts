import type { RootState } from "@/app/store"



export const selectSubModules = (
  state: RootState
) => state.submodules.modules



export const selectSelectedSubModule = (
  state: RootState
) => state.submodules.selectedModule



export const selectSubModulesPagination = (
  state: RootState
) => state.submodules.pagination



export const selectSubModulesLoading = (
  state: RootState
) => state.submodules.loading



export const selectSubModulesError = (
  state: RootState
) => state.submodules.error



export const selectSubModulesSuccess = (
  state: RootState
) => state.submodules.success