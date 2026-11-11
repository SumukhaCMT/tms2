import { CalendarDays, UserCheck, Coins, Package, ImagePlus, ClipboardCheck } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const ADD_HUNDI_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "When, where and which deities", icon: CalendarDays },
  { id: 2, label: "Witness Details", subLabel: "Who witnessed the opening", icon: UserCheck },
  { id: 3, label: "Cash Denominations", subLabel: "Count the notes and coins", icon: Coins },
  { id: 4, label: "Physical Items", subLabel: "Any other item found", icon: Package },
  { id: 5, label: "Hundi Image", subLabel: "Upload a photo (optional)", icon: ImagePlus },
  { id: 6, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]
