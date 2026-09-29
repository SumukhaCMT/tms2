import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"
import { addSubscriptionBundle } from "../subscriptionBundleThunks"
import { fetchSubscriptionPlans } from "../../subscription/subscriptionPlanThunks"
import {
  selectSubscriptionPlansLoading,
} from "../subscriptionBundleSelectors"
import type { SubscriptionBundleFormValues } from "../subscriptionBundleValidation"
import SubscriptionBundleForm from "../components/SubscriptionBundleForm"
export default function AddSubscriptionBundle() {
  const navigate = useNavigate()
 const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector(
    selectSubscriptionPlansLoading
  )

   useEffect(() => {
      dispatch(fetchSubscriptionPlans())
    }, [dispatch])

    const handleSubmit = async (
        data: SubscriptionBundleFormValues,
      ) => {
        console.log(
          "SUBSCRIPTION BUNDLE FORM SUBMIT:",
          data,
        )
    
        try {
          const result = await dispatch(
            addSubscriptionBundle(data),
          ).unwrap()
    
          console.log(
            "SUBSCRIPTION BUNDLE CREATED:",
            result,
          )
    
          navigate("/subscriptionbundles")
        } catch (error) {
          console.error(
            "SUBSCRIPTION BUNDLE CREATE FAILED:",
            error,
          )
        }
      }
  return (
    <div className="space-y-6">
      

      <SubscriptionBundleForm
       loading={loading}
      onSubmit={handleSubmit}
      
       
        onCancel={() =>
          navigate("/subscriptionbundles")
        }
      />
    </div>
  )
}