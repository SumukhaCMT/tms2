



import { createAsyncThunk } from "@reduxjs/toolkit"

import {
  createSubscriptionPlan,
  getSubscriptionPlanById,
  getSubscriptionPlans,
  removeSubscriptionPlan,
  updateSubscriptionPlan,
} from "./services/subscriptionPlanService"

import type {
  CreateSubscriptionPlanPayload,
  SubscriptionPlan,
  UpdateSubscriptionPlanPayload,
} from "./subscriptionPlanTypes"

import type { SubscriptionPlanFormData } from "./subscriptionPlanValidation"

/* =========================================================
   FETCH ALL
========================================================= */

export const fetchSubscriptionPlans = createAsyncThunk<
  SubscriptionPlan[],
  void,
  { rejectValue: string }
>(
  "subscriptionPlans/fetchSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSubscriptionPlans()

      console.log(
        "SUBSCRIPTION PLANS API RESPONSE:",
        response.data,
      )

      return response.data.data
    } catch (error: unknown) {
      console.error(
        "FETCH SUBSCRIPTION PLANS ERROR:",
        error,
      )

      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch subscription plans.",
        ),
      )
    }
  },
)

/* =========================================================
   FETCH BY ID
========================================================= */

export const fetchSubscriptionPlanById = createAsyncThunk<
  SubscriptionPlan,
  number,
  { rejectValue: string }
>(
  "subscriptionPlans/fetchSubscriptionPlanById",
  async (id, { rejectWithValue }) => {
    try {
      const response =
        await getSubscriptionPlanById(id)

      return response.data.data
    } catch (error: unknown) {
      console.error(
        "FETCH SUBSCRIPTION PLAN ERROR:",
        error,
      )

      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch subscription plan.",
        ),
      )
    }
  },
)

/* =========================================================
   ADD
========================================================= */

export const addSubscriptionPlan = createAsyncThunk<
  SubscriptionPlan,
  SubscriptionPlanFormData,
  { rejectValue: string }
>(
  "subscriptionPlans/addSubscriptionPlan",
  async (formData, { rejectWithValue }) => {
    try {
      console.log(
        "FORM DATA BEFORE API:",
        formData,
      )

      /*
       * -----------------------------------------------------
       * ALWAYS CALCULATE TOTAL PRICE HERE
       * -----------------------------------------------------
       *
       * Total = Price + GST
       *
       * Example:
       * Price = 123
       * GST   = 12%
       *
       * GST amount = 14.76
       * Total      = 137.76
       */
      const price =
        Number(formData.plan_price) || 0

      const gst =
        Number(formData.plan_gst_percentage) || 0

      const calculatedTotal = Number(
        (
          price +
          (price * gst) / 100
        ).toFixed(2),
      )

      const payload: CreateSubscriptionPlanPayload =
        {
          module_id: Number(
            formData.module_id,
          ),

          plan_name:
            formData.plan_name.trim(),

          plan_code:
            formData.plan_code
              .trim()
              .toUpperCase(),

          plan_type:
            formData.plan_type,

          plan_quantity:
            formData.plan_quantity ===
              null ||
            formData.plan_quantity ===
              undefined
              ? null
              : Number(
                  formData.plan_quantity,
                ),

          plan_duration_months:
            formData.plan_duration_months ===
              null ||
            formData.plan_duration_months ===
              undefined
              ? null
              : Number(
                  formData.plan_duration_months,
                ),

          plan_price: price,

          plan_gst_percentage: gst,

          /*
           * IMPORTANT:
           * Do not directly trust formData.plan_total_price.
           */
          plan_total_price:
            calculatedTotal,

          /*
           * AMC
           */
          plan_amc_price:
            formData.plan_type ===
              "perpetual" &&
            formData.plan_amc_price !==
              null &&
            formData.plan_amc_price !==
              undefined
              ? Number(
                  formData.plan_amc_price,
                )
              : null,

          plan_amc_duration_months:
            formData.plan_type ===
              "perpetual" &&
            formData.plan_amc_duration_months !==
              null &&
            formData.plan_amc_duration_months !==
              undefined
              ? Number(
                  formData.plan_amc_duration_months,
                )
              : null,

          plan_amc_gst_percentage:
            formData.plan_type ===
              "perpetual"
              ? Number(
                  formData.plan_amc_gst_percentage,
                ) || 0
              : 0,

          plan_amc_start_date:
            formData.plan_type ===
              "perpetual"
              ? formData.plan_amc_start_date ||
                null
              : null,

          plan_status:
            formData.plan_status,
        }

      console.log(
        "FINAL CREATE PAYLOAD:",
        JSON.stringify(
          payload,
          null,
          2,
        ),
      )

      const response =
        await createSubscriptionPlan(
          payload,
        )

      console.log(
        "CREATE API RESPONSE:",
        response.data,
      )

      return response.data.data
    } catch (error: unknown) {
      console.error(
        "CREATE SUBSCRIPTION PLAN ERROR:",
        error,
      )

      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create subscription plan.",
        ),
      )
    }
  },
)

/* =========================================================
   UPDATE
========================================================= */

export const editSubscriptionPlan = createAsyncThunk<
  SubscriptionPlan,
  {
    id: number
    data: UpdateSubscriptionPlanPayload
  },
  { rejectValue: string }
>(
  "subscriptionPlans/editSubscriptionPlan",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response =
        await updateSubscriptionPlan(
          id,
          data,
        )

      return response.data.data
    } catch (error: unknown) {
      console.error(
        "UPDATE SUBSCRIPTION PLAN ERROR:",
        error,
      )

      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update subscription plan.",
        ),
      )
    }
  },
)

/* =========================================================
   DELETE
========================================================= */

export const deleteSubscriptionPlan =
  createAsyncThunk<
    number,
    number,
    { rejectValue: string }
  >(
    "subscriptionPlans/deleteSubscriptionPlan",
    async (id, { rejectWithValue }) => {
      try {
        await removeSubscriptionPlan(id)

        return id
      } catch (error: unknown) {
        console.error(
          "DELETE SUBSCRIPTION PLAN ERROR:",
          error,
        )

        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to delete subscription plan.",
          ),
        )
      }
    },
  )

/* =========================================================
   ERROR HANDLER
========================================================= */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  /*
   * Axios-like error
   */
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: {
          success?: boolean
          message?: string
          error?: string
          errors?: unknown
        }
      }
    }

    const response = axiosError.response

    const responseData =
      response?.data

    /*
     * Print complete backend response.
     *
     * This is important for finding
     * exactly which field is failing.
     */
    console.error(
      "BACKEND STATUS:",
      response?.status,
    )

    console.error(
      "BACKEND ERROR RESPONSE:",
      JSON.stringify(
        responseData,
        null,
        2,
      ),
    )

    /*
     * Standard backend message
     */
    if (
      responseData?.message
    ) {
      /*
       * Also print validation errors
       * separately when available.
       */
      if (
        responseData.errors
      ) {
        console.error(
          "BACKEND VALIDATION ERRORS:",
          JSON.stringify(
            responseData.errors,
            null,
            2,
          ),
        )
      }

      return responseData.message
    }

    /*
     * Backend error
     */
    if (
      responseData?.error
    ) {
      return responseData.error
    }

    /*
     * Validation errors
     */
    if (
      responseData?.errors
    ) {
      if (
        typeof responseData.errors ===
        "string"
      ) {
        return responseData.errors
      }

      return JSON.stringify(
        responseData.errors,
      )
    }
  }

  /*
   * Normal JavaScript Error
   */
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}