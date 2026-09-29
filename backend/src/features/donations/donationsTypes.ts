export type DonationMethod =
  | "cash"
  | "cheque"
  | "upi"
  | "dd"
  | "net_banking"

export type ItemType =
  | "consumable"
  | "fixed"

export interface Donation {
  id: number
  organization_id: number
  temple_id: number
  user_id: number
  donation_number: string
  donor_name: string
  donor_phone: string | null
  donor_email: string | null
  donor_pincode: string | null
  donor_state: string | null
  donor_city: string | null
  donor_address_line1: string | null
  donor_address_line2: string | null
  monetary: number
  inkind: number
  stored_at: string | null
  receiver_user_id: number | null
  receiver_name: string | null
  receiver_phone: string | null
  receiver_designation: string | null
  overall_remarks: string | null
  receipt_pdf_path: string | null
  receipt_generated_at: Date | null
  created_by: number
  updated_by: number | null
  created_at: Date
  updated_at: Date
}

export interface DonationMonetary {
  id: number
  donation_id: number
  donation_method: DonationMethod
  donation_monetary_amount: number
  donation_monetary_bank_name: string | null
  donation_monetary_reference_number: string | null
  donation_monetary_reference_date: string | null
  donation_monetary_remarks: string | null
  // Required by the UI once donation_monetary_amount exceeds Rs. 50,000.
  donor_pan_number: string | null
  donor_aadhaar_number: string | null
  created_at: Date
  updated_at: Date
}

export interface DonationInkind {
  id: number
  donation_id: number
  item_type: ItemType
  item_title: string
  measurement: number | null
  measurement_unit: string | null
  quantity: number
  approximate_Market_value: number
  estimated_value: number
  remarks: string | null
  created_at: Date
  updated_at: Date
}

// ============================
// Create payloads
// (organization_id / temple_id / user_id / created_by are set by the
// controller from the authenticated session, never trusted from the
// request body)
// ============================

export interface CreateDonationData {
  organization_id: number
  temple_id: number
  user_id: number
  created_by: number
  donation_number: string
  donor_name: string
  donor_phone: string
  donor_email?: string | null
  donor_pincode: string
  donor_state: string
  donor_city: string
  donor_address_line1?: string | null
  donor_address_line2?: string | null
  monetary: 0 | 1
  inkind: 0 | 1
  stored_at: string
  overall_remarks?: string | null
  receiver_user_id?: number | null
  receiver_name?: string | null
  receiver_phone?: string | null
  receiver_designation?: string | null
}

export interface CreateDonationMonetaryData {
  donation_method: DonationMethod
  donation_monetary_amount: number
  donation_monetary_bank_name: string
  donation_monetary_reference_number: string
  donation_monetary_reference_date: string
  donation_monetary_remarks?: string | null
  // Required (and validated) only when donation_monetary_amount > 50000.
  donor_pan_number?: string | null
  donor_aadhaar_number?: string | null
}

export interface CreateDonationInkindData {
  item_type: ItemType
  item_title: string
  measurement: number
  measurement_unit: string
  quantity: number
  approximate_Market_value: number
  estimated_value?: number
  remarks?: string | null
}

export interface CreateDonationPayload {
  donation: CreateDonationData
  donation_monetary?: CreateDonationMonetaryData
  donation_inkind?: CreateDonationInkindData[]
}

export interface CreateDonationResult {
  id: number
  donation_number: string
}

export interface TempleOption {
  id: number
  temp_name: string
}

// ============================
// Measurement units (in-kind "Measurement Unit" dropdown). Seeded rows
// have is_custom = 0; a unit typed in via "+ Add custom unit" is
// inserted with is_custom = 1 so it persists and shows up in the
// dropdown for every donation entered after it.
// ============================

export interface MeasurementUnit {
  id: number
  unit_name: string
  is_custom: number
}

// ============================
// Receiver candidates (receiver-name search on the "Receiver Details"
// step) and a plain user lookup (used to default the receiver to
// whoever is actually filling out the form when they leave the receiver
// fields blank). Only temple_admins of the caller's own temple and
// org_admins of the caller's own organization are searchable as
// receivers - `designation` is that role's display name
// (default_roles.user_role_name), used to auto-fill the Receiver
// Designation field when one of these is picked.
// ============================

export interface TempleUserOption {
  id: number
  user_name: string
  user_phone: string | null
  role_id: number
  designation: string
}

// ============================
// Donor suggestions (donor-name search on the "Donor Details" step, so a
// repeat donor doesn't have to be typed in from scratch).
// ============================

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


// ============================
// List (GET) types
// ============================

// Trimmed projection of `donations` used by the donors list page — enough
// to render the table/grid without pulling in the monetary/inkind detail
// rows (those are only needed on a future "view donation" screen).
export interface DonationListItem {
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
  created_at: Date
  temp_name: string
  created_by_name: string | null
}

// Mirrors the tenant-isolation rule already used in auth.middleware.ts:
// super_admin sees everything, org_admin is scoped to their organization,
// temple_admin/user are scoped to their own temple.
export interface DonationListScope {
  organization_id: number
  temple_id: number
}


// ============================
// Update payload
// organization_id / temple_id / user_id never change on update — only
// updated_by is set by the controller from the authenticated session.
// donation_number is also immutable (read-only in the wizard), so it is
// intentionally not part of this shape.
// ============================

export interface UpdateDonationData {
  donor_name: string
  donor_phone: string
  donor_email?: string | null
  donor_pincode: string
  donor_state: string
  donor_city: string
  donor_address_line1?: string | null
  donor_address_line2?: string | null
  monetary: 0 | 1
  inkind: 0 | 1
  stored_at: string
  overall_remarks?: string | null
  updated_by: number
}

export interface UpdateDonationPayload {
  donation: UpdateDonationData
  donation_monetary?: CreateDonationMonetaryData
  donation_inkind?: CreateDonationInkindData[]
}

// ============================
// Single donation detail — the full donation row plus its monetary/inkind
// detail rows. Used to prefill the edit wizard and to check ownership
// (organization_id/temple_id) before an update or delete.
// ============================

export interface DonationDetail extends Donation {
  temp_name: string
  created_by_name: string | null
  created_by_role_id: number | null
  donation_monetary: DonationMonetary | null
  donation_inkind: DonationInkind[]
}
