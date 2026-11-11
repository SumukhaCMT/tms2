import { useAuth } from "@/features/auth/useAuth"

import { ManualOrderWizard } from "./ManualOrderWizard"
import { createManualOrder, emptyManualOrderForm } from "./manualOrderService"

export default function AddManualOrder() {
  const { user } = useAuth()
  return <ManualOrderWizard initialForm={emptyManualOrderForm(user?.name ?? "")} onSubmit={createManualOrder} />
}
