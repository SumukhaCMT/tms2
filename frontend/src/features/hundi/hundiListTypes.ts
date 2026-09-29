export interface HundiApiRow {
  id: number
  opened_at: string
  temple_id: number
  temp_name: string
  deity_id: number
  deity_name: string
  hundi_number: string
  hundi_name: string
  witness_full_name: string
  total_cash: number
  created_at: string
  created_by_name: string
  has_signed_receipt: number
}

export interface HundiRow {
  id: number
  dbId: number
  templeName: string
  deityName: string
  hundiNumber: string
  hundiName: string
  witnessName: string
  totalCash: number
  openedAt: string
  date: string
  createdByName: string
  hasSignedReceipt: boolean
}

export const PAGE_SIZE = 11
