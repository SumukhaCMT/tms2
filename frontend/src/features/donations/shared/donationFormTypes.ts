import type { ComponentType } from "react"

export type DonationType = "monetary" | "inkind" | "both"
export type DonationMethod = "cash" | "cheque" | "upi" | "dd" | "net_banking"
export type ItemType = "consumable" | "fixed"

export interface MonetaryDetailsForm {
  donationMethod: DonationMethod | ""
  donationAmount: string
  bankName: string
  referenceNumber: string
  referenceDate: string
  monetaryRemarks: string
  panNumber: string
  aadhaarNumber: string
}

export const PAN_AADHAAR_THRESHOLD = 50000

export interface InkindDetailsForm {
  itemType: ItemType | ""
  itemTitle: string
  measurement: string
  measurementUnit: string
  quantity: string
  approxMarketValue: string
  estimatedValue: string
  inkindRemarks: string
}

export type { MeasurementUnitOption } from "@/features/inventory/shared/inventoryFormTypes"

export type FormErrors = Record<string, string>

export const DONATION_TYPE_OPTIONS: { value: DonationType; label: string }[] = [
  { value: "monetary", label: "Monetary" },
  { value: "inkind", label: "In-Kind" },
  { value: "both", label: "Both (Monetary & In-Kind)" },
]

export const DONATION_METHOD_OPTIONS: { value: DonationMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "dd", label: "Demand Draft (DD)" },
  { value: "net_banking", label: "Net Banking" },
]

export const ITEM_TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "consumable", label: "Consumable" },
  { value: "fixed", label: "Fixed" },
]

const INDIA_STATES_AND_UTS: string[] = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

export const INDIA_STATE_OPTIONS: { value: string; label: string }[] =
  INDIA_STATES_AND_UTS.map((state) => ({ value: state, label: state }))


export interface StepDefinition {
  id: number
  label: string
  subLabel: string
  icon: ComponentType<{ className?: string }>
}
