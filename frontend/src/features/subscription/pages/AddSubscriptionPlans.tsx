

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import type { AppDispatch } from "@/app/store"

import { fetchModulesList } from "../../modules/moduleThunks"
import { addSubscriptionPlan } from "../subscriptionPlanThunks"

import {
  selectSubscriptionPlansLoading,
} from "../subscriptionPlanSelectors"

import type { SubscriptionPlanFormData } from "../subscriptionPlanValidation"

import SubscriptionPlansForm from "../components/SubscriptionPlansForm"

export default function AddSubscriptionPlans() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector(
    selectSubscriptionPlansLoading,
  )

  useEffect(() => {
    dispatch(fetchModulesList())
  }, [dispatch])

  const handleSubmit = async (
    data: SubscriptionPlanFormData,
  ) => {
    console.log(
      "SUBSCRIPTION FORM SUBMIT:",
      data,
    )

    try {
      const result = await dispatch(
        addSubscriptionPlan(data),
      ).unwrap()

      console.log(
        "SUBSCRIPTION PLAN CREATED:",
        result,
      )

      navigate("/subscriptionPlans")
    } catch (error) {
      console.error(
        "SUBSCRIPTION PLAN CREATE FAILED:",
        error,
      )
    }
  }

  return (
    <SubscriptionPlansForm
    
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() =>
        navigate("/subscriptionPlans")
      }
    />
  )
}

