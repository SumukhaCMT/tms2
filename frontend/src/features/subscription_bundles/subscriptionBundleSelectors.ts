import type { RootState } from "@/app/store"

export const selectSubscriptionBundles = (
  state: RootState,
) => state.subscriptionBundles.bundles

export const selectSubscriptionPlans = (
  state: RootState,
) => state.subscriptionBundles.plans

export const selectSelectedSubscriptionBundle = (
  state: RootState,
) => state.subscriptionBundles.selectedBundle

export const selectSubscriptionBundleLoading = (
  state: RootState,
) => state.subscriptionBundles.loading

export const selectSubscriptionPlansLoading = (
  state: RootState,
) => state.subscriptionBundles.plansLoading

export const selectSubscriptionBundleError = (
  state: RootState,
) => state.subscriptionBundles.error