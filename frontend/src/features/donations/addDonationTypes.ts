import { UserRound, HandCoins, UserCheck, ClipboardCheck } from "lucide-react"

import type { DonationType, StepDefinition } from "./shared/donationFormTypes"

export interface DonorDetailsForm {
  donationNumber: string
  templeId: string
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

export interface ReceiverDetailsForm {
  receiverUserId: string
  receiverName: string
  receiverPhone: string
  receiverDesignation: string
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface TempleUserOption {
  id: number
  user_name: string
  user_phone: string | null
  role_id: number
  designation: string
}

export interface DonorSuggestion {
  donor_name: string
  donor_phone: string | null
  donor_email: string | null
  donor_pincode: string | null
  donor_state: string | null
  donor_city: string | null
  donor_address_line1: string | null
  donor_address_line2: string | null
}

export interface SubmittedDonation {
  id: number
  donationNumber: string
}

export const ADD_DONATION_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Donor Details", subLabel: "Who is donating", icon: UserRound },
  { id: 2, label: "Donation Details", subLabel: "What is being donated", icon: HandCoins },
  { id: 3, label: "Receiver Details", subLabel: "Who is entering this", icon: UserCheck },
  { id: 4, label: "Review & Submit", subLabel: "Confirm and save", icon: ClipboardCheck },
]
