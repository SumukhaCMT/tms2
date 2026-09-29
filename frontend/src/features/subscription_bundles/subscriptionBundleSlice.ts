// import { createSlice } from "@reduxjs/toolkit"

// import {
//   addSubscriptionBundle,
//   fetchSubscriptionBundleById,
//   fetchSubscriptionBundles,
//   fetchSubscriptionPlans,
//   removeSubscriptionBundle,
//   updateSubscriptionBundle,
// } from "./subscriptionBundleThunks"

// import type { SubscriptionBundleState } from "./subscriptionBundleTypes"

// const initialState: SubscriptionBundleState = {
//   bundles: [],
//   plans: [],

//   selectedBundle: null,

//   loading: false,
//   plansLoading: false,

//   error: null,
// }

// const subscriptionBundleSlice = createSlice({
//   name: "subscriptionBundles",

//   initialState,

//   reducers: {
//     clearSelectedSubscriptionBundle: (state) => {
//       state.selectedBundle = null
//       state.error = null
//     },

//     clearSubscriptionBundleError: (state) => {
//       state.error = null
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // Fetch bundles
//       .addCase(fetchSubscriptionBundles.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })

//       .addCase(fetchSubscriptionBundles.fulfilled, (state, action) => {
//         state.loading = false
//         state.bundles = action.payload
//       })

//       .addCase(fetchSubscriptionBundles.rejected, (state, action) => {
//         state.loading = false
//         state.error =
//           action.payload || "Failed to fetch subscription bundles"
//       })

//       // Fetch single bundle
//       .addCase(fetchSubscriptionBundleById.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })

//       .addCase(
//         fetchSubscriptionBundleById.fulfilled,
//         (state, action) => {
//           state.loading = false
//           state.selectedBundle = action.payload
//         },
//       )

//       .addCase(fetchSubscriptionBundleById.rejected, (state, action) => {
//         state.loading = false
//         state.error =
//           action.payload || "Failed to fetch subscription bundle"
//       })

//       // Add
//       .addCase(addSubscriptionBundle.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })

//       .addCase(addSubscriptionBundle.fulfilled, (state, action) => {
//         state.loading = false

//         state.bundles.unshift(action.payload)
//       })

//       .addCase(addSubscriptionBundle.rejected, (state, action) => {
//         state.loading = false
//         state.error =
//           action.payload || "Failed to create subscription bundle"
//       })

//       // Update
//       .addCase(updateSubscriptionBundle.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })

//       .addCase(updateSubscriptionBundle.fulfilled, (state, action) => {
//         state.loading = false

//         const index = state.bundles.findIndex(
//           (bundle) => bundle.id === action.payload.id,
//         )

//         if (index !== -1) {
//           state.bundles[index] = action.payload
//         }

//         state.selectedBundle = action.payload
//       })

//       .addCase(updateSubscriptionBundle.rejected, (state, action) => {
//         state.loading = false
//         state.error =
//           action.payload || "Failed to update subscription bundle"
//       })

//       // Delete
//       .addCase(removeSubscriptionBundle.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })

//       .addCase(removeSubscriptionBundle.fulfilled, (state, action) => {
//         state.loading = false

//         state.bundles = state.bundles.filter(
//           (bundle) => bundle.id !== action.payload,
//         )
//       })

//       .addCase(removeSubscriptionBundle.rejected, (state, action) => {
//         state.loading = false
//         state.error =
//           action.payload || "Failed to delete subscription bundle"
//       })

//       // Plans
//       .addCase(fetchSubscriptionPlans.pending, (state) => {
//         state.plansLoading = true
//       })

//       .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
//         state.plansLoading = false
//         state.plans = action.payload
//       })

//       .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
//         state.plansLoading = false
//         state.error =
//           action.payload || "Failed to fetch subscription plans"
//       })
//   },
// })

// export const {
//   clearSelectedSubscriptionBundle,
//   clearSubscriptionBundleError,
// } = subscriptionBundleSlice.actions

// export default subscriptionBundleSlice.reducer


import { createSlice } from "@reduxjs/toolkit"

import {
  addSubscriptionBundle,
  fetchSubscriptionBundleById,
  fetchSubscriptionBundles,
  fetchSubscriptionPlans,
  removeSubscriptionBundle,
  updateSubscriptionBundle,
} from "./subscriptionBundleThunks"

import type { SubscriptionBundleState } from "./subscriptionBundleTypes"

const initialState: SubscriptionBundleState = {
  bundles: [],
  plans: [],
  selectedBundle: null,
  loading: false,
  plansLoading: false,
  error: null,
}

const subscriptionBundleSlice = createSlice({
  name: "subscriptionBundles",

  initialState,

  reducers: {
    clearSelectedSubscriptionBundle: (state) => {
      state.selectedBundle = null
      state.error = null
    },

    clearSubscriptionBundleError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder

      // ============================================================
      // FETCH ALL SUBSCRIPTION BUNDLES
      // ============================================================

      .addCase(
        fetchSubscriptionBundles.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        fetchSubscriptionBundles.fulfilled,
        (state, action) => {
          state.loading = false

          /*
           * The thunk must return SubscriptionBundle[].
           * Keeping this assignment direct ensures Redux stores
           * the actual array.
           */
          state.bundles = Array.isArray(action.payload)
            ? action.payload
            : []
        },
      )

      .addCase(
        fetchSubscriptionBundles.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload ??
            "Failed to fetch subscription bundles"
        },
      )

      // ============================================================
      // FETCH SINGLE SUBSCRIPTION BUNDLE
      // ============================================================

      .addCase(
        fetchSubscriptionBundleById.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        fetchSubscriptionBundleById.fulfilled,
        (state, action) => {
          state.loading = false
          state.selectedBundle = action.payload
        },
      )

      .addCase(
        fetchSubscriptionBundleById.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload ??
            "Failed to fetch subscription bundle"
        },
      )

      // ============================================================
      // ADD SUBSCRIPTION BUNDLE
      // ============================================================

      .addCase(
        addSubscriptionBundle.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        addSubscriptionBundle.fulfilled,
        (state, action) => {
          state.loading = false

          state.bundles.unshift(action.payload)
        },
      )

      .addCase(
        addSubscriptionBundle.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload ??
            "Failed to create subscription bundle"
        },
      )

      // ============================================================
      // UPDATE SUBSCRIPTION BUNDLE
      // ============================================================

      .addCase(
        updateSubscriptionBundle.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        updateSubscriptionBundle.fulfilled,
        (state, action) => {
          state.loading = false

          const index =
            state.bundles.findIndex(
              (bundle) =>
                bundle.id === action.payload.id,
            )

          if (index !== -1) {
            state.bundles[index] = action.payload
          }

          state.selectedBundle = action.payload
        },
      )

      .addCase(
        updateSubscriptionBundle.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload ??
            "Failed to update subscription bundle"
        },
      )

      // ============================================================
      // DELETE SUBSCRIPTION BUNDLE
      // ============================================================

      .addCase(
        removeSubscriptionBundle.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        removeSubscriptionBundle.fulfilled,
        (state, action) => {
          state.loading = false

          state.bundles =
            state.bundles.filter(
              (bundle) =>
                bundle.id !== action.payload,
            )

          if (
            state.selectedBundle?.id ===
            action.payload
          ) {
            state.selectedBundle = null
          }
        },
      )

      .addCase(
        removeSubscriptionBundle.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload ??
            "Failed to delete subscription bundle"
        },
      )

      // ============================================================
      // FETCH SUBSCRIPTION PLANS
      // ============================================================

      .addCase(
        fetchSubscriptionPlans.pending,
        (state) => {
          state.plansLoading = true
          state.error = null
        },
      )

      .addCase(
        fetchSubscriptionPlans.fulfilled,
        (state, action) => {
          state.plansLoading = false

          state.plans = Array.isArray(action.payload)
            ? action.payload
            : []
        },
      )

      .addCase(
        fetchSubscriptionPlans.rejected,
        (state, action) => {
          state.plansLoading = false

          state.error =
            action.payload ??
            "Failed to fetch subscription plans"
        },
      )
  },
})

export const {
  clearSelectedSubscriptionBundle,
  clearSubscriptionBundleError,
} =
  subscriptionBundleSlice.actions

export default subscriptionBundleSlice.reducer