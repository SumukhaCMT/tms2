

import type { RootState } from "@/app/store"

/* -------------------------------------------------------------------------- */
/* Modules                                                                    */
/* -------------------------------------------------------------------------- */

export const selectModules = (
  state: RootState
) => state.modules.modules

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export const selectModulesPagination = (
  state: RootState
) => state.modules.pagination

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

export const selectModulesLoading = (
  state: RootState
) => state.modules.loading

/* -------------------------------------------------------------------------- */
/* Error                                                                      */
/* -------------------------------------------------------------------------- */

export const selectModulesError = (
  state: RootState
) => state.modules.error

/* -------------------------------------------------------------------------- */
/* Success                                                                    */
/* -------------------------------------------------------------------------- */

export const selectModulesSuccess = (
  state: RootState
) => state.modules.success