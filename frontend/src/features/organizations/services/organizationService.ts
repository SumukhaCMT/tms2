

import api from "@/axios/axios"

import type {
  CreateOrganizationPayload,
  OrganizationListParams,
  OrganizationListResponse,
  OrganizationResponse,
  UpdateOrganizationPayload,
   
  UpdateOrganizationSubscriptionPayload,
} from "../organizationsTypes"

const ORGANIZATION_API =
  "/v1/organizations"

/* =========================================================
   ORGANIZATION SERVICE
========================================================= */

export const organizationService = {
  /* =======================================================
     GET ORGANIZATIONS
  ======================================================= */

  getOrganizations: async (
    params?: OrganizationListParams,
  ): Promise<OrganizationListResponse> => {
    const response =
      await api.get<OrganizationListResponse>(
        ORGANIZATION_API,
        {
          params,
        },
      )

    return response.data
  },

  /* =======================================================
     GET ORGANIZATION BY ID
  ======================================================= */

  getOrganizationById: async (
    id: number | string,
  ): Promise<OrganizationResponse> => {
    const response =
      await api.get<OrganizationResponse>(
        `${ORGANIZATION_API}/${id}`,
      )

    return response.data
  },

  /* =======================================================
     CREATE ORGANIZATION
  ======================================================= */

  createOrganization: async (
    payload: CreateOrganizationPayload,
  ): Promise<OrganizationResponse> => {
    try {
      console.log(
        "CREATE ORGANIZATION REQUEST:",
        JSON.stringify(
          payload,
          null,
          2,
        ),
      )

      const response =
        await api.post<OrganizationResponse>(
          ORGANIZATION_API,
          payload,
        )

      console.log(
        "CREATE ORGANIZATION SUCCESS:",
        response.data,
      )

      return response.data
    } catch (error: unknown) {
      console.error(
        "CREATE ORGANIZATION FAILED:",
        error,
      )

      throw error
    }
  },

  /* =======================================================
     UPDATE ORGANIZATION
  ======================================================= */

  // updateOrganization: async (
  //   id: number | string,
  //   payload: UpdateOrganizationPayload,
  // ): Promise<OrganizationResponse> => {
  //   const response =
  //     await api.put<OrganizationResponse>(
  //       `${ORGANIZATION_API}/${id}`,
  //       payload,
  //     )

  //   return response.data
  // },

    /* =======================================================
     UPDATE ORGANIZATION
  ======================================================= */

  // updateOrganization: async (
  //   id: number | string,
  //   payload: UpdateOrganizationPayload,
  // ): Promise<OrganizationResponse> => {

  //   const response =
  //     await api.put<OrganizationResponse>(
  //       `${ORGANIZATION_API}/${id}`,
  //       payload,
  //     )

  //   return response.data
  // },


  // /* =======================================================
  //    UPDATE ORGANIZATION SUBSCRIPTION
  // ======================================================= */

  // updateOrganizationSubscription: async (
  //   id: number | string,
  //   payload: UpdateOrganizationSubscriptionPayload,
  // ): Promise<OrganizationResponse> => {

  //   const response =
  //     await api.put<OrganizationResponse>(
  //       `${ORGANIZATION_API}/subscriptions/${id}`,
  //       payload,
  //     )

  //   return response.data
  // },


  /* =======================================================
   UPDATE ORGANIZATION
======================================================= */

updateOrganization: async (
  id: number | string,
  payload: Omit<UpdateOrganizationPayload, "id">,
): Promise<OrganizationResponse> => {
  const response =
    await api.put<OrganizationResponse>(
      `${ORGANIZATION_API}/${id}`,
      payload,
    )

  return response.data
},

/* =======================================================
   UPDATE ORGANIZATION SUBSCRIPTION
======================================================= */

updateOrganizationSubscription: async (
  id: number | string,
  payload: Omit<
    UpdateOrganizationSubscriptionPayload,
    "id"
  >,
): Promise<OrganizationResponse> => {
  const response =
    await api.put<OrganizationResponse>(
      `${ORGANIZATION_API}/subscriptions/${id}`,
      payload,
    )

  return response.data
},
  /* =======================================================
     DELETE ORGANIZATION
  ======================================================= */

  deleteOrganization: async (
    id: number | string,
  ): Promise<void> => {
    await api.delete(
      `${ORGANIZATION_API}/${id}`,
    )
  },
}