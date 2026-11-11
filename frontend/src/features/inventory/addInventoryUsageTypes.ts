import { PackageMinus, ClipboardCheck } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const ADD_INVENTORY_USAGE_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Usage Details", subLabel: "What was used and where", icon: PackageMinus },
  { id: 2, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]
