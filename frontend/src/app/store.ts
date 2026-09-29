import { configureStore } from "@reduxjs/toolkit"

import organizationReducer from "@/features/organizations/organizationSlice"
import moduleReducer from "../features/modules/moduleSlice"
import submoduleReducer from "../features/sub_modules/submoduleSlice"

import subscriptionPlansReducer from "../features/subscription/subscriptionPlanSlice"
import subscriptionBundlesReducer from "@/features/subscription_bundles/subscriptionBundleSlice"
import systemDefaultsReducer from "@/features/setting/systemDefaultsSlice"
import rolesReducer
  from "@/features/roles/roleSlice"
export const store = configureStore({
  reducer: {
    organizations: organizationReducer,
    modules: moduleReducer,
    submodules: submoduleReducer,
   subscriptionPlans: subscriptionPlansReducer,
  subscriptionBundles: subscriptionBundlesReducer,
    systemDefaults:
      systemDefaultsReducer,
         roles:
        rolesReducer,
   
  },
})

export type RootState = ReturnType<
  typeof store.getState
>

export type AppDispatch = typeof store.dispatch