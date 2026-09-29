import type { RootState } from "@/app/store"

/* -------------------------------------------------------------------------- */
/* ALL                                                                        */
/* -------------------------------------------------------------------------- */

export const selectSubModules = (
  state: RootState
) => state.submodules.modules

/* -------------------------------------------------------------------------- */
/* SELECTED                                                                   */
/* -------------------------------------------------------------------------- */

export const selectSelectedSubModule = (
  state: RootState
) => state.submodules.selectedModule

/* -------------------------------------------------------------------------- */
/* PAGINATION                                                                 */
/* -------------------------------------------------------------------------- */

export const selectSubModulesPagination = (
  state: RootState
) => state.submodules.pagination

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

export const selectSubModulesLoading = (
  state: RootState
) => state.submodules.loading

/* -------------------------------------------------------------------------- */
/* ERROR                                                                      */
/* -------------------------------------------------------------------------- */

export const selectSubModulesError = (
  state: RootState
) => state.submodules.error

/* -------------------------------------------------------------------------- */
/* SUCCESS                                                                    */
/* -------------------------------------------------------------------------- */

export const selectSubModulesSuccess = (
  state: RootState
) => state.submodules.success