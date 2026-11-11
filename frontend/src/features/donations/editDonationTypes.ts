import { UserRound, HandCoins, ClipboardCheck } from "lucide-react"

import type { DonationType, StepDefinition } from "./shared/donationFormTypes"

export interface DonorDetailsForm {
  donationNumber: string
  donorName: string
  donorPhone: string
  donorEmail: string
  donorPincode: string
  donorState: string
  donorCity: string
  donorAddressLine1: string
  donorAddressLine2: string
  donationType: DonationType | ""
  storedAt: string
  overallRemarks: string
}

export const EDIT_DONATION_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Donor Details", subLabel: "Who is donating", icon: UserRound },
  { id: 2, label: "Donation Details", subLabel: "What is being donated", icon: HandCoins },
  { id: 3, label: "Review & Submit", subLabel: "Confirm and save", icon: ClipboardCheck },
]
