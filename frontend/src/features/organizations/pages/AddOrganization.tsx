// import { useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import {
//   useDispatch,
//   useSelector,
// } from "react-redux"

// import type {
//   AppDispatch,
// } from "@/app/store"

// import OrganizationForm from "../component/OrganizationForm"

// import {
//   createOrganization,
// } from "../organizationThunks"

// import {
//   fetchSubscriptionPlans,
// } from "../../subscription/subscriptionPlanThunks"

// import {
//   fetchSubscriptionBundles,
// } from "../../subscription_bundles/subscriptionBundleThunks"

// import {
//   selectOrganizationsLoading,
// } from "../organizationSelectors"

// import {
//   selectSubscriptionPlansLoading,
// } from "../../subscription/subscriptionPlanSelectors"

// import {
//   selectSubscriptionBundleLoading,
// } from "../../subscription_bundles/subscriptionBundleSelectors"

// import type {
//   CreateOrganizationPayload,
// } from "../organizationsTypes"

// export default function AddOrganizations() {
//   const navigate =
//     useNavigate()

//   const dispatch =
//     useDispatch<AppDispatch>()

//   const organizationLoading =
//     useSelector(
//       selectOrganizationsLoading,
//     )

//   const plansLoading =
//     useSelector(
//       selectSubscriptionPlansLoading,
//     )

//   const bundlesLoading =
//     useSelector(
//       selectSubscriptionBundleLoading,
//     )

//   useEffect(() => {
//     dispatch(
//       fetchSubscriptionPlans(),
//     )

//     dispatch(
//       fetchSubscriptionBundles(),
//     )
//   }, [dispatch])

//   const handleSubmit = async (
//     data: CreateOrganizationPayload,
//   ) => {
//     const result =
//       await dispatch(
//         createOrganization(
//           data,
//         ),
//       )

//     if (
//       createOrganization.fulfilled.match(
//         result,
//       )
//     ) {
//       navigate(
//         "/organizations",
//       )
//     }
//   }

//   const loading =
//     organizationLoading ||
//     plansLoading ||
//     bundlesLoading

//   return (
//     <div className="w-full">
//       <OrganizationForm
//         onSubmit={
//           handleSubmit
//         }
//         loading={
//           loading
//         }
//         onCancel={() =>
//           navigate(
//             "/organizations",
//           )
//         }
//       />
//     </div>
//   )
// }


import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  useDispatch,
  useSelector,
} from "react-redux"

import type {
  AppDispatch,
} from "@/app/store"

import OrganizationForm from "../component/OrganizationForm"

import {
  createOrganization,
} from "../organizationThunks"

import {
  fetchSubscriptionPlans,
} from "../../subscription/subscriptionPlanThunks"

import {
  fetchSubscriptionBundles,
} from "../../subscription_bundles/subscriptionBundleThunks"

import {
  selectOrganizationsLoading,
} from "../organizationSelectors"

import {
  selectSubscriptionPlansLoading,
} from "../../subscription/subscriptionPlanSelectors"

import {
  selectSubscriptionBundleLoading,
} from "../../subscription_bundles/subscriptionBundleSelectors"

import type {
  CreateOrganizationPayload,
} from "../organizationsTypes"

export default function AddOrganizations() {
  const navigate =
    useNavigate()

  const dispatch =
    useDispatch<AppDispatch>()

  const organizationLoading =
    useSelector(
      selectOrganizationsLoading,
    )

  const plansLoading =
    useSelector(
      selectSubscriptionPlansLoading,
    )

  const bundlesLoading =
    useSelector(
      selectSubscriptionBundleLoading,
    )

  useEffect(() => {
    dispatch(
      fetchSubscriptionPlans(),
    )

    dispatch(
      fetchSubscriptionBundles(),
    )
  }, [dispatch])

  /* =========================================================
     CREATE ORGANIZATION
  ========================================================= */

  const handleSubmit = async (
    data: CreateOrganizationPayload,
  ) => {
    try {
      await dispatch(
        createOrganization(data),
      ).unwrap()

      // Only navigate when API succeeds
      navigate("/organizations")
    } catch (error: unknown) {
      console.error(
        "CREATE ORGANIZATION ERROR:",
        error,
      )

      /*
       * IMPORTANT:
       * Re-throw the error so OrganizationForm
       * can display the email/phone error.
       */
      throw error
    }
  }

  const loading =
    organizationLoading ||
    plansLoading ||
    bundlesLoading

  return (
    <div className="w-full">
      <OrganizationForm
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() =>
          navigate(
            "/organizations",
          )
        }
      />
    </div>
  )
}