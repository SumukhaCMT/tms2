    import type { RootState } from "@/app/store"

export const selectSubscriptionPlans = (
  state: RootState,
) =>
  state.subscriptionPlans.plans

export const selectSelectedSubscriptionPlan = (
  state: RootState,
) =>
  state.subscriptionPlans.selectedPlan

export const selectSubscriptionPlansLoading = (
  state: RootState,
) =>
  state.subscriptionPlans.loading

export const selectSubscriptionPlansError = (
  state: RootState,
) =>
  state.subscriptionPlans.error

export const selectSubscriptionPlansPagination = (
  state: RootState,
) =>
  state.subscriptionPlans.pagination