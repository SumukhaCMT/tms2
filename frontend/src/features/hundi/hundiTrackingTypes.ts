export interface IncompleteHundiApiRow {
  id: number
  temple_id: number
  temp_name: string
  hundi_number: string
  hundi_name: string
  deity_name: string
  opened_at: string
  total_cash: number
  deposited_amount: number
  remaining_amount: number
}

export interface HundiBankDepositApiRow {
  id: number
  temple_id: number
  temp_name: string
  hundi_id: number
  hundi_number: string
  hundi_name: string
  total_cash: number
  deposit_amount: number
  remaining_amount: number
  bank_name: string
  account_holder_name: string | null
  account_number: string
  ifsc_code: string
  transaction_number: string | null
  deposit_date: string
  remarks: string | null
  deposited_by_name: string
  created_at: string
}

export interface DepositedByOption {
  id: number
  name: string
  phone: string | null
}

export interface HundiTrackingForm {
  hundiId: string
  ifscCode: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  transactionNumber: string
  depositAmount: string
  depositedById: number | null
  depositedByQuery: string
  depositDate: string
  remarks: string
}

export function emptyHundiTrackingForm(): HundiTrackingForm {
  return {
    hundiId: "",
    ifscCode: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    transactionNumber: "",
    depositAmount: "",
    depositedById: null,
    depositedByQuery: "",
    depositDate: "",
    remarks: "",
  }
}

export type FormErrors = Record<string, string>

export interface HundiBankDepositDetailApiRow {
  id: number
  organization_id: number
  temple_id: number
  deity_id: number
  hundi_id: number
  hundi_number: string
  hundi_name: string
  temp_name: string
  bank_name: string
  account_holder_name: string | null
  account_number: string
  ifsc_code: string
  transaction_number: string | null
  deposit_date: string
  deposit_amount: number
  remarks: string | null
  deposited_by: number
  deposited_by_name: string
  deposited_by_phone: string | null
  total_cash: number
  remaining_amount: number
}
