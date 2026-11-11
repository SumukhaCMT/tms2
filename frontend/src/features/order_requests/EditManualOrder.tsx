import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { apiErrorMessage } from "@/features/subscription/services/cartService"

import { ManualOrderWizard } from "./ManualOrderWizard"
import { getManualOrder, updateManualOrder, type ManualOrderForm } from "./manualOrderService"

export default function EditManualOrder() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const [form, setForm] = useState<ManualOrderForm | null>(null)

  useEffect(() => {
    getManualOrder(id)
      .then(setForm)
      .catch((error) => {
        showCmtToast("expiry", apiErrorMessage(error))
        navigate("/manual_order")
      })
  }, [id, navigate])

  if (!form) return <Skeleton className="h-96 w-full" />

  return <ManualOrderWizard initialForm={form} isEdit onSubmit={(next) => updateManualOrder(id, next)} />
}
