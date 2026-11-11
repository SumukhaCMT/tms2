export interface DonationViewMonetary {
  donation_method: string
  donation_monetary_amount: number
  donation_monetary_bank_name: string | null
  donation_monetary_reference_number: string | null
  donation_monetary_reference_date: string | null
  donation_monetary_remarks: string | null
  donor_pan_number: string | null
  donor_aadhaar_number: string | null
}

export interface DonationViewInkind {
  id: number
  item_type: string
  item_title: string
  measurement: number | null
  measurement_unit: string | null
  quantity: number
  approximate_Market_value: number
  estimated_value: number
  remarks: string | null
}

export interface DonationViewDetail {
  id: number
  donation_number: string
  temp_name: string
  donor_name: string
  donor_phone: string | null
  donor_email: string | null
  donor_pincode: string | null
  donor_state: string | null
  donor_city: string | null
  donor_address_line1: string | null
  donor_address_line2: string | null
  stored_at: string | null
  receiver_name: string | null
  receiver_phone: string | null
  receiver_designation: string | null
  overall_remarks: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
  donation_monetary: DonationViewMonetary | null
  donation_inkind: DonationViewInkind[]
}
