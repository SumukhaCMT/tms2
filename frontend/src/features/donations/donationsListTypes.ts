export type DonationListType = "Monetary" | "In-Kind" | "Both"

export const DONATION_TYPE_BADGE: Record<DonationListType, string> = {
  Monetary: "bg-green-100 text-green-700",
  "In-Kind": "bg-blue-100 text-blue-700",
  Both: "bg-purple-100 text-purple-700",
}

export interface DonationApiRow {
  id: number
  donation_number: string
  donor_name: string
  donor_phone: string | null
  donor_email: string | null
  donor_city: string | null
  donor_state: string | null
  monetary: number
  inkind: number
  stored_at: string | null
  created_at: string
  temp_name: string
  created_by_name: string | null
}

export interface Donor {
  id: string
  dbId: number
  name: string
  phone: string
  email: string
  city: string
  state: string
  type: DonationListType
  storedAt: string
  date: string
  templeName: string
  createdByName: string
}

export const PAGE_SIZE = 11
