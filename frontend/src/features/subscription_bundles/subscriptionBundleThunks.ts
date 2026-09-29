// import { createAsyncThunk } from "@reduxjs/toolkit"

// import type {
//   CreateSubscriptionBundlePayload,
//   SubscriptionBundle,
//   SubscriptionPlan,
//   UpdateSubscriptionBundlePayload,
// } from "./subscriptionBundleTypes"

// import { subscriptionBundleService } from "./services/subscriptionBundleService"

// export const fetchSubscriptionBundles = createAsyncThunk<
//   SubscriptionBundle[],
//   void,
//   { rejectValue: string }
// >(
//   "subscriptionBundles/fetchSubscriptionBundles",
//   async (_, { rejectWithValue }) => {
//     try {
//       return await subscriptionBundleService.getAll()
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to fetch subscription bundles",
//       )
//     }
//   },
// )

// export const fetchSubscriptionBundleById = createAsyncThunk<
//   SubscriptionBundle,
//   number,
//   { rejectValue: string }
// >(
//   "subscriptionBundles/fetchSubscriptionBundleById",
//   async (id, { rejectWithValue }) => {
//     try {
//       return await subscriptionBundleService.getById(id)
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to fetch subscription bundle",
//       )
//     }
//   },
// )

// export const addSubscriptionBundle = createAsyncThunk<
//   SubscriptionBundle,
//   CreateSubscriptionBundlePayload,
//   { rejectValue: string }
// >(
//   "subscriptionBundles/addSubscriptionBundle",
//   async (payload, { rejectWithValue }) => {
//     try {
//       return await subscriptionBundleService.create(payload)
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to create subscription bundle",
//       )
//     }
//   },
// )

// export const updateSubscriptionBundle = createAsyncThunk<
//   SubscriptionBundle,
//   {
//     id: number
//     data: UpdateSubscriptionBundlePayload
//   },
//   { rejectValue: string }
// >(
//   "subscriptionBundles/updateSubscriptionBundle",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       return await subscriptionBundleService.update(id, data)
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to update subscription bundle",
//       )
//     }
//   },
// )

// export const removeSubscriptionBundle = createAsyncThunk<
//   number,
//   number,
//   { rejectValue: string }
// >(
//   "subscriptionBundles/removeSubscriptionBundle",
//   async (id, { rejectWithValue }) => {
//     try {
//       await subscriptionBundleService.remove(id)

//       return id
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to delete subscription bundle",
//       )
//     }
//   },
// )

// export const fetchSubscriptionPlans = createAsyncThunk<
//   SubscriptionPlan[],
//   void,
//   { rejectValue: string }
// >(
//   "subscriptionBundles/fetchSubscriptionPlans",
//   async (_, { rejectWithValue }) => {
//     try {
//       return await subscriptionBundleService.getPlans()
//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Failed to fetch subscription plans",
//       )
//     }
//   },
// )


import { createAsyncThunk } from "@reduxjs/toolkit"

import type {
  CreateSubscriptionBundlePayload,
  SubscriptionBundle,
  SubscriptionPlan,
  UpdateSubscriptionBundlePayload,
} from "./subscriptionBundleTypes"

import { subscriptionBundleService } from "./services/subscriptionBundleService"

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: unknown
          }
        }
      }
    ).response

    const message =
      response?.data?.message

    if (typeof message === "string") {
      return message
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message = (
      error as {
        message?: unknown
      }
    ).message

    if (typeof message === "string") {
      return message
    }
  }

  return fallback
}

export const fetchSubscriptionBundles =
  createAsyncThunk<
    SubscriptionBundle[],
    void,
    { rejectValue: string }
  >(
    "subscriptionBundles/fetchSubscriptionBundles",
    async (_, { rejectWithValue }) => {
      try {
        return await subscriptionBundleService.getAll()
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch subscription bundles",
          ),
        )
      }
    },
  )

export const fetchSubscriptionBundleById =
  createAsyncThunk<
    SubscriptionBundle,
    number,
    { rejectValue: string }
  >(
    "subscriptionBundles/fetchSubscriptionBundleById",
    async (id, { rejectWithValue }) => {
      try {
        return await subscriptionBundleService.getById(
          id,
        )
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch subscription bundle",
          ),
        )
      }
    },
  )

export const addSubscriptionBundle =
  createAsyncThunk<
    SubscriptionBundle,
    CreateSubscriptionBundlePayload,
    { rejectValue: string }
  >(
    "subscriptionBundles/addSubscriptionBundle",
    async (payload, { rejectWithValue }) => {
      try {
        return await subscriptionBundleService.create(
          payload,
        )
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to create subscription bundle",
          ),
        )
      }
    },
  )

export const updateSubscriptionBundle =
  createAsyncThunk<
    SubscriptionBundle,
    {
      id: number
      data: UpdateSubscriptionBundlePayload
    },
    { rejectValue: string }
  >(
    "subscriptionBundles/updateSubscriptionBundle",
    async (
      { id, data },
      { rejectWithValue },
    ) => {
      try {
        return await subscriptionBundleService.update(
          id,
          data,
        )
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to update subscription bundle",
          ),
        )
      }
    },
  )

export const removeSubscriptionBundle =
  createAsyncThunk<
    number,
    number,
    { rejectValue: string }
  >(
    "subscriptionBundles/removeSubscriptionBundle",
    async (id, { rejectWithValue }) => {
      try {
        await subscriptionBundleService.remove(id)

        return id
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to delete subscription bundle",
          ),
        )
      }
    },
  )

export const fetchSubscriptionPlans =
  createAsyncThunk<
    SubscriptionPlan[],
    void,
    { rejectValue: string }
  >(
    "subscriptionBundles/fetchSubscriptionPlans",
    async (_, { rejectWithValue }) => {
      try {
        return await subscriptionBundleService.getPlans()
      } catch (error: unknown) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch subscription plans",
          ),
        )
      }
    },
  )

