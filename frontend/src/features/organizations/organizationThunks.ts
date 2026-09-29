

// import { createAsyncThunk } from "@reduxjs/toolkit"

// import {
//   organizationService,
// } from "./services/organizationService"

// import type {
//   CreateOrganizationPayload,
//   OrganizationListParams,
//    UpdateOrganizationPayload,
//   UpdateOrganizationSubscriptionPayload,
// } from "./organizationsTypes"

// interface OrganizationThunkError {
//   message: string
// }

// /* =========================================================
//    FETCH ORGANIZATIONS
// ========================================================= */

// export const fetchOrganizations =
//   createAsyncThunk<
//     Awaited<
//       ReturnType<
//         typeof organizationService.getOrganizations
//       >
//     >,
//     OrganizationListParams,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/fetchOrganizations",
//     async (
//       params = {},
//       { rejectWithValue },
//     ) => {
//       try {
//         return await organizationService.getOrganizations(
//           params,
//         )
//       } catch (error: unknown) {
//         const err = error as {
//           response?: {
//             data?: {
//               message?: string
//             }
//           }
//           message?: string
//         }

//         return rejectWithValue({
//           message:
//             err.response?.data?.message ||
//             err.message ||
//             "Failed to fetch organizations",
//         })
//       }
//     },
//   )

// /* =========================================================
//    FETCH ORGANIZATION BY ID
// ========================================================= */

// export const fetchOrganizationById =
//   createAsyncThunk<
//     Awaited<
//       ReturnType<
//         typeof organizationService.getOrganizationById
//       >
//     >,
//     number | string,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/fetchOrganizationById",
//     async (
//       id,
//       { rejectWithValue },
//     ) => {
//       try {
//         return await organizationService.getOrganizationById(
//           id,
//         )
//       } catch (error: unknown) {
//         const err = error as {
//           response?: {
//             data?: {
//               message?: string
//             }
//           }
//           message?: string
//         }

//         return rejectWithValue({
//           message:
//             err.response?.data?.message ||
//             err.message ||
//             "Failed to fetch organization",
//         })
//       }
//     },
//   )

// /* =========================================================
//    CREATE ORGANIZATION
// ========================================================= */

// export const createOrganization =
//   createAsyncThunk<
//     Awaited<
//       ReturnType<
//         typeof organizationService.createOrganization
//       >
//     >,
//     CreateOrganizationPayload,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/createOrganization",
//     async (
//       payload,
//       { rejectWithValue },
//     ) => {
//       try {
//         return await organizationService.createOrganization(
//           payload,
//         )
//       } catch (error: unknown) {
//         const err = error as {
//           response?: {
//             data?: {
//               message?: string
//             }
//           }
//           message?: string
//         }

//         const message =
//           err.response?.data?.message ||
//           err.message ||
//           "Failed to create organization"

//         console.error(
//           "CREATE ORGANIZATION THUNK ERROR:",
//           message,
//         )

//         return rejectWithValue({
//           message,
//         })
//       }
//     },
//   )

// /* =========================================================
//    UPDATE ORGANIZATION
// ========================================================= */

// // export const updateOrganization =
// //   createAsyncThunk<
// //     Awaited<
// //       ReturnType<
// //         typeof organizationService.updateOrganization
// //       >
// //     >,
// //     UpdateOrganizationPayload,
// //     {
// //       rejectValue: OrganizationThunkError
// //     }
// //   >(
// //     "organizations/updateOrganization",
// //     async (
// //       payload,
// //       { rejectWithValue },
// //     ) => {
// //       try {
// //         return await organizationService.updateOrganization(
// //           payload.id,
// //           payload,
// //         )
// //       } catch (error: unknown) {
// //         const err = error as {
// //           response?: {
// //             data?: {
// //               message?: string
// //             }
// //           }
// //           message?: string
// //         }

// //         return rejectWithValue({
// //           message:
// //             err.response?.data?.message ||
// //             err.message ||
// //             "Failed to update organization",
// //         })
// //       }
// //     },
// //   )


// /* =========================================================
//    UPDATE ORGANIZATION
// ========================================================= */

// export const updateOrganization =
//   createAsyncThunk<
//     any,
//     UpdateOrganizationPayload,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/updateOrganization",
//     async (
//       payload,
//       { rejectWithValue },
//     ) => {

//       try {

//         const {
//           id,
//           ...updatePayload
//         } = payload

//         return await organizationService
//           .updateOrganization(
//             id,
//             updatePayload,
//           )

//       } catch (error: any) {

//         return rejectWithValue({
//           message:
//             error?.response?.data?.message ??
//             error?.message ??
//             "Failed to update organization",
//         })
//       }
//     },
//   )


// /* =========================================================
//    UPDATE ORGANIZATION SUBSCRIPTION
// ========================================================= */

// export const updateOrganizationSubscription =
//   createAsyncThunk<
//     any,
//     UpdateOrganizationSubscriptionPayload,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/updateOrganizationSubscription",
//     async (
//       payload,
//       { rejectWithValue },
//     ) => {

//       try {

//         const {
//           id,
//           ...updatePayload
//         } = payload

//         return await organizationService
//           .updateOrganizationSubscription(
//             id,
//             updatePayload,
//           )

//       } catch (error: any) {

//         return rejectWithValue({
//           message:
//             error?.response?.data?.message ??
//             error?.message ??
//             "Failed to update subscription",
//         })
//       }
//     },
//   )

// /* =========================================================
//    DELETE ORGANIZATION
// ========================================================= */

// export const deleteOrganization =
//   createAsyncThunk<
//     Awaited<
//       ReturnType<
//         typeof organizationService.deleteOrganization
//       >
//     >,
//     number | string,
//     {
//       rejectValue: OrganizationThunkError
//     }
//   >(
//     "organizations/deleteOrganization",
//     async (
//       id,
//       { rejectWithValue },
//     ) => {
//       try {
//         return await organizationService.deleteOrganization(
//           id,
//         )
//       } catch (error: unknown) {
//         const err = error as {
//           response?: {
//             data?: {
//               message?: string
//             }
//           }
//           message?: string
//         }

//         return rejectWithValue({
//           message:
//             err.response?.data?.message ||
//             err.message ||
//             "Failed to delete organization",
//         })
//       }
//     },
//   )


import { createAsyncThunk } from "@reduxjs/toolkit"

import {
  organizationService,
} from "./services/organizationService"

import type {
  CreateOrganizationPayload,
  OrganizationListParams,
  UpdateOrganizationPayload,
  UpdateOrganizationSubscriptionPayload,
} from "./organizationsTypes"

interface OrganizationThunkError {
  message: string
}

/* =========================================================
   FETCH ORGANIZATIONS
========================================================= */

export const fetchOrganizations =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.getOrganizations
      >
    >,
    OrganizationListParams,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/fetchOrganizations",
    async (
      params = {},
      { rejectWithValue },
    ) => {
      try {
        return await organizationService.getOrganizations(
          params,
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch organizations",
        })
      }
    },
  )

/* =========================================================
   FETCH ORGANIZATION BY ID
========================================================= */

export const fetchOrganizationById =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.getOrganizationById
      >
    >,
    number | string,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/fetchOrganizationById",
    async (
      id,
      { rejectWithValue },
    ) => {
      try {
        return await organizationService.getOrganizationById(
          id,
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch organization",
        })
      }
    },
  )

/* =========================================================
   CREATE ORGANIZATION
========================================================= */

export const createOrganization =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.createOrganization
      >
    >,
    CreateOrganizationPayload,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/createOrganization",
    async (
      payload,
      { rejectWithValue },
    ) => {
      try {
        return await organizationService.createOrganization(
          payload,
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to create organization"

        console.error(
          "CREATE ORGANIZATION THUNK ERROR:",
          message,
        )

        return rejectWithValue({
          message,
        })
      }
    },
  )

/* =========================================================
   UPDATE ORGANIZATION
========================================================= */

export const updateOrganization =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.updateOrganization
      >
    >,
    UpdateOrganizationPayload,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/updateOrganization",
    async (
      payload,
      { rejectWithValue },
    ) => {
      try {
        const {
          id,
          ...updatePayload
        } = payload

        return await organizationService.updateOrganization(
          id,
          updatePayload,
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to update organization",
        })
      }
    },
  )

/* =========================================================
   UPDATE ORGANIZATION SUBSCRIPTION
========================================================= */

export const updateOrganizationSubscription =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.updateOrganizationSubscription
      >
    >,
    UpdateOrganizationSubscriptionPayload,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/updateOrganizationSubscription",
    async (
      payload,
      { rejectWithValue },
    ) => {
      try {
        const {
          id,
          ...updatePayload
        } = payload

        return await organizationService
          .updateOrganizationSubscription(
            id,
            updatePayload,
          )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to update subscription",
        })
      }
    },
  )

/* =========================================================
   DELETE ORGANIZATION
========================================================= */

export const deleteOrganization =
  createAsyncThunk<
    Awaited<
      ReturnType<
        typeof organizationService.deleteOrganization
      >
    >,
    number | string,
    {
      rejectValue: OrganizationThunkError
    }
  >(
    "organizations/deleteOrganization",
    async (
      id,
      { rejectWithValue },
    ) => {
      try {
        return await organizationService.deleteOrganization(
          id,
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string
            }
          }
          message?: string
        }

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to delete organization",
        })
      }
    },
  )

