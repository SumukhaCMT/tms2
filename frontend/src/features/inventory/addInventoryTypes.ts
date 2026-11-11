import { Boxes, ClipboardCheck, ListPlus } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const ADD_INVENTORY_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Inventory Basic Details", subLabel: "Given by, date & type", icon: Boxes },
  { id: 2, label: "Inventory Items", subLabel: "Add one or more items", icon: ListPlus },
  { id: 3, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]
