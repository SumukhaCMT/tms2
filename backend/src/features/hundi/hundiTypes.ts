export type DenominationType = "note" | "coin"

export interface Hundi {
  id: number
  organization_id: number
  temple_id: number
  define_hundi_id: number
  opened_at: string
  witness_full_name: string
  witness_designation: string | null
  witness_email: string | null
  witness_phone: string | null
  witness_address_line1: string | null
  witness_address_line2: string | null
  witness_city: string | null
  witness_remarks: string | null
  hundi_image: string | null
  summary: string | null
  general_remark: string | null
  signed_receipt_pdf_path: string | null
  signed_receipt_uploaded_at: Date | null
  created_by: number
  updated_by: number | null
  created_at: Date
  updated_at: Date
}

export interface DenominationCatalogItem {
  id: number
  denomination: number
  type: DenominationType
  sort_order: number
}

export interface HundiDenomination {
  id: number
  hundi_id: number
  denomination_id: number
  denomination: number
  type: DenominationType
  quantity: number
  total_amount: number
}

export interface HundiItem {
  id: number
  hundi_id: number
  item_name: string
  quantity: number
  measurement_weight: number | null
  measurement: string | null
  approximate_value: number | null
  exact_value: number | null
}

// ============================
// Define Hundi (master data — the physical hundi boxes, managed outside
// the opening wizard on the "Define Hundi" page)
// ============================

export interface DefineHundi {
  id: number
  organization_id: number
  temple_id: number
  deity_id: number
  hundi_number: string
  hundi_name: string
  status: "active" | "inactive"
  created_by: number
  updated_by: number | null
  created_at: Date
  updated_at: Date
}

export interface DefineHundiListItem {
  id: number
  temple_id: number
  temp_name: string
  deity_id: number
  deity_name: string
  hundi_number: string
  hundi_name: string
  status: "active" | "inactive"
  created_at: Date
}

export interface CreateDefineHundiData {
  organization_id: number
  temple_id: number
  deity_id: number
  hundi_number: string
  hundi_name: string
  created_by: number
}

export interface UpdateDefineHundiData {
  deity_id: number
  hundi_number: string
  hundi_name: string
  status: "active" | "inactive"
  updated_by: number
}

// ============================
// Create Hundi (opening) payload
// One wizard submission can open several hundis at once — one per
// deity selected on the Basic Details step that has an active
// define_hundi record. organization_id / temple_id / created_by are set
// by the controller from the authenticated session, never trusted from
// the request body.
// ============================

export interface CreateHundiWitnessData {
  witness_full_name: string
  witness_designation?: string | null
  witness_email?: string | null
  witness_phone?: string | null
  witness_address_line1?: string | null
  witness_address_line2?: string | null
  witness_city?: string | null
  witness_remarks?: string | null
}

export interface CreateHundiDenominationData {
  denomination_id: number
  quantity: number
}

export interface CreateHundiItemData {
  item_name: string
  quantity?: number
  measurement_weight?: number | null
  measurement?: string | null
  approximate_value?: number | null
  exact_value?: number | null
}

export interface CreateHundiData {
  organization_id: number
  temple_id: number
  created_by: number
  opened_at: string
  witness: CreateHundiWitnessData
  extra_witnesses: CreateHundiWitnessData[]
  denominations: CreateHundiDenominationData[]
  items: CreateHundiItemData[]
  hundi_image: string | null
  summary: string | null
  general_remark: string | null
}

// ============================
// Update Hundi (opening) payload — Basic Details (opened_at, temple,
// deity/define_hundi) are fixed at creation and never editable, so this
// only covers witness / denominations / item / summary / general_remark.
// ============================

export interface UpdateHundiData {
  witness: CreateHundiWitnessData
  extra_witnesses: CreateHundiWitnessData[]
  denominations: CreateHundiDenominationData[]
  items: CreateHundiItemData[]
  summary: string | null
  general_remark: string | null
  updated_by: number
}

export interface CreateHundiResultRow {
  id: number
  define_hundi_id: number
  hundi_number: string
  hundi_name: string
  deity_id: number
  deity_name: string
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface DeityOption {
  id: number
  name: string
}

// ============================
// List (GET) types
// ============================

export interface HundiListItem {
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
  created_at: Date
  created_by_name: string | null
  has_signed_receipt: number
}

export interface HundiListScope {
  organization_id: number
  temple_id: number
}

export interface HundiDetail extends Hundi {
  hundi_number: string
  hundi_name: string
  deity_id: number
  deity_name: string
  temp_name: string
  created_by_name: string | null
  created_by_role_id: number
  extra_witnesses: HundiWitness[]
  denominations: HundiDenomination[]
  items: HundiItem[]
}

// ============================
// Hundi Bank Deposit Tracking
// ============================

export interface IncompleteHundiOption {
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

export interface HundiRemaining {
  id: number
  organization_id: number
  temple_id: number
  deity_id: number
  total_cash: number
  deposited_amount: number
  remaining_amount: number
}

export interface HundiBankDepositListItem {
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
  created_at: Date
}

export interface DepositedByOption {
  id: number
  name: string
  phone: string | null
}

export interface IfscBankDetail {
  ifsc: string
  bank: string
  branch: string
}

export interface CreateHundiBankDepositData {
  organization_id: number
  temple_id: number
  hundi_id: number
  deity_id: number
  bank_name: string
  account_holder_name: string
  account_number: string
  ifsc_code: string
  transaction_number: string
  deposit_date: string
  deposit_amount: number
  remarks: string | null
  deposited_by: number
  created_by: number
}

export interface HundiBankDepositDetail {
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

export interface UpdateHundiBankDepositData {
  bank_name: string
  account_holder_name: string
  account_number: string
  ifsc_code: string
  transaction_number: string
  deposit_date: string
  deposit_amount: number
  remarks: string | null
  deposited_by: number
}

export interface WitnessSuggestion {
  name: string
  designation: string | null
  phone: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  remarks: string | null
  source: "user" | "witness"
}

export interface HundiWitness extends CreateHundiWitnessData {
  id: number
  hundi_id: number
}
