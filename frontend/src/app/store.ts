import { configureStore } from "@reduxjs/toolkit"

import organizationReducer from "@/features/organizations/organizationSlice"
import moduleReducer from "../features/modules/moduleSlice"
import submoduleReducer from "../features/sub_modules/submoduleSlice"

import subscriptionPlansReducer from "../features/subscription/subscriptionPlanSlice"
import cartReducer from "../features/subscription/cartSlice"
import subscriptionBundlesReducer from "@/features/subscription_bundles/subscriptionBundleSlice"
import systemDefaultsReducer from "@/features/setting/systemDefaultsSlice"
import templeReducer from "@/features/temple/templeSlice";
import paymentMethodsReducer from "@/features/payment_method/paymentMethodSlice";
import deityReducer from "@/features/deities/deitySlice";
import sevaReducer from "@/features/seva/sevaSlice";
import trusteeReducer from "@/features/trustees/trusteeSlice";
import tokenReducer from "@/features/token/tokenSlice";
import sevaBookingReducer from "@/features/seva_booking/sevaBookingSlice";
import rolesReducer
  from "@/features/roles/roleSlice"
  import devoteeReducer from "@/features/devotee/devoteeSlice";
export const store = configureStore({
  reducer: {
    organizations: organizationReducer,
    modules: moduleReducer,
    submodules: submoduleReducer,
   subscriptionPlans: subscriptionPlansReducer,
    cart: cartReducer,
  subscriptionBundles: subscriptionBundlesReducer,
    systemDefaults:systemDefaultsReducer,
         roles:rolesReducer,
        temples: templeReducer,
        paymentMethods: paymentMethodsReducer,
        deities: deityReducer,
        seva: sevaReducer,
        trustees: trusteeReducer,
        tokens: tokenReducer,
         sevaBooking: sevaBookingReducer,
         devotees: devoteeReducer,
      
   
  },
})

export type RootState = ReturnType<
  typeof store.getState
>

export type AppDispatch = typeof store.dispatch