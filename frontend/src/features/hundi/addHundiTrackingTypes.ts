import { Banknote, ClipboardCheck } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const ADD_HUNDI_TRACKING_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Deposit Details", subLabel: "Bank and deposit information", icon: Banknote },
  { id: 2, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]
