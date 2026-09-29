import type { WitnessApi } from "./shared/useWitnessList"

export interface HundiViewDenomination {
  id: number
  denomination: number
  type: "note" | "coin"
  quantity: number
  total_amount: number
}

export interface HundiViewItem {
  id: number
  item_name: string
  quantity: number
  measurement_weight: number | null
  measurement: string | null
  approximate_value: number | null
  exact_value: number | null
}

export interface HundiViewDetail {
  id: number
  opened_at: string
  temp_name: string
  deity_name: string
  hundi_number: string
  hundi_name: string
  witness_full_name: string
  witness_designation: string | null
  witness_email: string | null
  witness_phone: string | null
  witness_address_line1: string | null
  witness_address_line2: string | null
  witness_city: string | null
  witness_remarks: string | null
  extra_witnesses: WitnessApi[]
  hundi_image: string | null
  signed_receipt_pdf_path: string | null
  signed_receipt_uploaded_at: string | null
  summary: string | null
  general_remark: string | null
  created_by_name: string
  created_at: string
  updated_at: string
  denominations: HundiViewDenomination[]
  items: HundiViewItem[]
}
