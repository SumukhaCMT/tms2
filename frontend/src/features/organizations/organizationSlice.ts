


// import { createSlice } from "@reduxjs/toolkit"

// import {
//   createOrganization,
//   deleteOrganization,
//   fetchOrganizationById,
//   fetchOrganizations,
//   updateOrganization,
// } from "./organizationThunks"

// import type {
//   Organization,
//   OrganizationDetails,
  
//   OrganizationPagination,
// } from "./organizationsTypes"

// interface OrganizationState {
//   organizations: Organization[]

//   selectedOrganization: OrganizationDetails | null
//   // selectedOrganization: OrganizationDetailsData | null

//   pagination: OrganizationPagination

//   loading: boolean
//   detailsLoading: boolean
//   submitting: boolean
//   deleting: boolean

//   error: string | null
// }

// const initialState: OrganizationState = {
//   organizations: [],

//   selectedOrganization: null,

//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//   },

//   loading: false,
//   detailsLoading: false,
//   submitting: false,
//   deleting: false,

//   error: null,
// }

// const organizationSlice = createSlice({
//   name: "organizations",

//   initialState,

//   reducers: {
//     clearOrganizationError: (state) => {
//       state.error = null
//     },

//     clearSelectedOrganization: (state) => {
//       state.selectedOrganization = null
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // =========================================================
//       // FETCH ORGANIZATIONS
//       // =========================================================

//       .addCase(
//         fetchOrganizations.pending,
//         (state) => {
//           state.loading = true
//           state.error = null
//         },
//       )

//       .addCase(
//         fetchOrganizations.fulfilled,
//         (state, action) => {
//           state.loading = false

//           state.organizations =
//             action.payload.data

//           state.pagination =
//             action.payload.pagination
//         },
//       )

//       .addCase(
//         fetchOrganizations.rejected,
//         (state, action) => {
//           state.loading = false

//           state.error =
//             (action.payload as string) ||
//             "Failed to fetch organizations"
//         },
//       )

//       // =========================================================
//       // FETCH ORGANIZATION BY ID
//       // =========================================================

//       .addCase(
//         fetchOrganizationById.pending,
//         (state) => {
//           state.detailsLoading = true

//           state.error = null

//           // Clear old organization while loading
//           state.selectedOrganization = null
//         },
//       )

//       .addCase(
//         fetchOrganizationById.fulfilled,
//         (state, action) => {
//           state.detailsLoading = false

//           state.selectedOrganization =
//             action.payload.data
//         },
//       )

//       .addCase(
//         fetchOrganizationById.rejected,
//         (state, action) => {
//           state.detailsLoading = false

//           state.selectedOrganization = null

//           state.error =
//             (action.payload as string) ||
//             "Failed to fetch organization"
//         },
//       )

//       // =========================================================
//       // CREATE ORGANIZATION
//       // =========================================================

//       .addCase(
//         createOrganization.pending,
//         (state) => {
//           state.submitting = true
//           state.error = null
//         },
//       )

//       .addCase(
//         createOrganization.fulfilled,
//         (state) => {
//           state.submitting = false
//         },
//       )

//       .addCase(
//         createOrganization.rejected,
//         (state, action) => {
//           state.submitting = false

//           state.error =
//             (action.payload as string) ||
//             "Failed to create organization"
//         },
//       )

//       // =========================================================
//       // UPDATE ORGANIZATION
//       // =========================================================

//       .addCase(
//         updateOrganization.pending,
//         (state) => {
//           state.submitting = true
//           state.error = null
//         },
//       )

//       .addCase(
//         updateOrganization.fulfilled,
//         (state) => {
//           state.submitting = false
//         },
//       )

//       .addCase(
//         updateOrganization.rejected,
//         (state, action) => {
//           state.submitting = false

//           state.error =
//             (action.payload as string) ||
//             "Failed to update organization"
//         },
//       )

//       // =========================================================
//       // DELETE ORGANIZATION
//       // =========================================================

//       .addCase(
//         deleteOrganization.pending,
//         (state) => {
//           state.deleting = true
//           state.error = null
//         },
//       )

//       .addCase(
//         deleteOrganization.fulfilled,
//         (state) => {
//           state.deleting = false
//         },
//       )

//       .addCase(
//         deleteOrganization.rejected,
//         (state, action) => {
//           state.deleting = false

//           state.error =
//             (action.payload as string) ||
//             "Failed to delete organization"
//         },
//       )
//   },
// })

// export const {
//   clearOrganizationError,
//   clearSelectedOrganization,
// } = organizationSlice.actions

// export default organizationSlice.reducer




import { createSlice } from "@reduxjs/toolkit"

import {
  createOrganization,
  deleteOrganization,
  fetchOrganizationById,
  fetchOrganizations,
  updateOrganization,
} from "./organizationThunks"

import type {
  Organization,
  OrganizationDetailsData,
  OrganizationPagination,
} from "./organizationsTypes"

interface OrganizationState {
  organizations: Organization[]

  selectedOrganization: OrganizationDetailsData | null

  pagination: OrganizationPagination

  loading: boolean
  detailsLoading: boolean
  submitting: boolean
  deleting: boolean

  error: string | null
}

const initialState: OrganizationState = {
  organizations: [],

  selectedOrganization: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: false,
  detailsLoading: false,
  submitting: false,
  deleting: false,

  error: null,
}

const organizationSlice = createSlice({
  name: "organizations",

  initialState,

  reducers: {
    clearOrganizationError: (state) => {
      state.error = null
    },

    clearSelectedOrganization: (state) => {
      state.selectedOrganization = null
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================================================
         FETCH ORGANIZATIONS
      ========================================================= */

      .addCase(
        fetchOrganizations.pending,
        (state) => {
          state.loading = true
          state.error = null
        },
      )

      .addCase(
        fetchOrganizations.fulfilled,
        (state, action) => {
          state.loading = false

          state.organizations =
            action.payload.data

          state.pagination =
            action.payload.pagination
        },
      )

      .addCase(
        fetchOrganizations.rejected,
        (state, action) => {
          state.loading = false

          state.error =
            action.payload?.message ||
            "Failed to fetch organizations"
        },
      )

      /* =========================================================
         FETCH ORGANIZATION BY ID
      ========================================================= */

      .addCase(
        fetchOrganizationById.pending,
        (state) => {
          state.detailsLoading = true

          state.error = null

          state.selectedOrganization = null
        },
      )

      .addCase(
        fetchOrganizationById.fulfilled,
        (state, action) => {
          state.detailsLoading = false

          state.selectedOrganization =
            action.payload.data
        },
      )

      .addCase(
        fetchOrganizationById.rejected,
        (state, action) => {
          state.detailsLoading = false

          state.selectedOrganization = null

          state.error =
            action.payload?.message ||
            "Failed to fetch organization"
        },
      )

      /* =========================================================
         CREATE ORGANIZATION
      ========================================================= */

      .addCase(
        createOrganization.pending,
        (state) => {
          state.submitting = true
          state.error = null
        },
      )

      .addCase(
        createOrganization.fulfilled,
        (state) => {
          state.submitting = false
        },
      )

      .addCase(
        createOrganization.rejected,
        (state, action) => {
          state.submitting = false

          state.error =
            action.payload?.message ||
            "Failed to create organization"
        },
      )

      /* =========================================================
         UPDATE ORGANIZATION
      ========================================================= */

      .addCase(
        updateOrganization.pending,
        (state) => {
          state.submitting = true
          state.error = null
        },
      )

      .addCase(
        updateOrganization.fulfilled,
        (state) => {
          state.submitting = false
        },
      )

      .addCase(
        updateOrganization.rejected,
        (state, action) => {
          state.submitting = false

          state.error =
            action.payload?.message ||
            "Failed to update organization"
        },
      )

      /* =========================================================
         DELETE ORGANIZATION
      ========================================================= */

      .addCase(
        deleteOrganization.pending,
        (state) => {
          state.deleting = true
          state.error = null
        },
      )

      .addCase(
        deleteOrganization.fulfilled,
        (state) => {
          state.deleting = false
        },
      )

      .addCase(
        deleteOrganization.rejected,
        (state, action) => {
          state.deleting = false

          state.error =
            action.payload?.message ||
            "Failed to delete organization"
        },
      )
  },
})

export const {
  clearOrganizationError,
  clearSelectedOrganization,
} = organizationSlice.actions

export default organizationSlice.reducer

