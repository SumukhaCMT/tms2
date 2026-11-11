


import { createSlice } from "@reduxjs/toolkit"

import {
  addSubscriptionPlan,
  deleteSubscriptionPlan,
  editSubscriptionPlan,
  fetchSubscriptionPlanById,
  fetchSubscriptionPlans,
} from "./subscriptionPlanThunks"

import type {
  SubscriptionPlanState,
} from "./subscriptionPlanTypes"

const initialState: SubscriptionPlanState = {
  plans: [],
  selectedPlan: null,

  loading: false,
  error: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
}

const subscriptionPlanSlice =
  createSlice({
    name: "subscriptionPlans",
    initialState,

    reducers: {
      clearSubscriptionPlanError: (
        state,
      ) => {
        state.error = null
      },

      clearSelectedSubscriptionPlan: (
        state,
      ) => {
        state.selectedPlan = null
      },
    },

    extraReducers: (builder) => {
      /* =====================================================
         FETCH ALL
      ===================================================== */

      builder.addCase(
        fetchSubscriptionPlans.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      builder.addCase(
        fetchSubscriptionPlans.fulfilled,
        (state, action) => {
          console.log(
            "REDUX PLANS PAYLOAD:",
            action.payload,
          )

          state.loading = false

          // IMPORTANT:
          // action.payload is already SubscriptionPlan[]
          state.plans = action.payload ?? []

          state.pagination = {
            page: 1,
            limit: 10,
            total: action.payload.length,
            totalPages: Math.max(
              1,
              Math.ceil(
                action.payload.length / 10,
              ),
            ),
          }

          state.error = null
        },
      )

      builder.addCase(
        fetchSubscriptionPlans.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            "Failed to fetch subscription plans."
        },
      )

      /* =====================================================
         FETCH ONE
      ===================================================== */

      builder.addCase(
        fetchSubscriptionPlanById.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      builder.addCase(
        fetchSubscriptionPlanById.fulfilled,
        (state, action) => {
          state.loading = false

          state.selectedPlan =
            action.payload

          state.error = null
        },
      )

      builder.addCase(
        fetchSubscriptionPlanById.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            "Failed to fetch subscription plan."
        },
      )

      /* =====================================================
         CREATE
      ===================================================== */

      builder.addCase(
        addSubscriptionPlan.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      builder.addCase(
        addSubscriptionPlan.fulfilled,
        (state, action) => {
          state.loading = false

          state.plans.unshift(
            action.payload,
          )

          state.pagination.total =
            state.plans.length

          state.pagination.totalPages =
            Math.max(
              1,
              Math.ceil(
                state.plans.length / 10,
              ),
            )

          state.error = null
        },
      )

      builder.addCase(
        addSubscriptionPlan.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            "Failed to create subscription plan."
        },
      )

      /* =====================================================
         UPDATE
      ===================================================== */

      builder.addCase(
        editSubscriptionPlan.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      builder.addCase(
        editSubscriptionPlan.fulfilled,
        (state, action) => {
          state.loading = false

          const index =
            state.plans.findIndex(
              (plan) =>
                plan.id ===
                action.payload.id,
            )

          if (index !== -1) {
            state.plans[index] =
              action.payload
          }

          state.selectedPlan =
            action.payload

          state.error = null
        },
      )

      builder.addCase(
        editSubscriptionPlan.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            "Failed to update subscription plan."
        },
      )

      /* =====================================================
         DELETE
      ===================================================== */

      builder.addCase(
        deleteSubscriptionPlan.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      builder.addCase(
        deleteSubscriptionPlan.fulfilled,
        (state, action) => {
          state.loading = false

          state.plans =
            state.plans.filter(
              (plan) =>
                plan.id !==
                action.payload,
            )

          state.pagination.total =
            state.plans.length

          state.pagination.totalPages =
            Math.max(
              1,
              Math.ceil(
                state.plans.length / 10,
              ),
            )

          state.error = null
        },
      )

      builder.addCase(
        deleteSubscriptionPlan.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            "Failed to delete subscription plan."
        },
      )
    },
  })

export const {
  clearSubscriptionPlanError,
  clearSelectedSubscriptionPlan,
} =
  subscriptionPlanSlice.actions

export default subscriptionPlanSlice.reducer

