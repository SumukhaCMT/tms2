export type OrganizationStatus = "active" | "inactive"

export type RegistrationSelectionType =
  | "plan"
  | "bundle"

export type RegistrationPaymentMethod =
  | "manual"

export type LicenseType =
  | "subscription"
  | "perpetual"

// export interface CreateOrganizationInput {
//   org_name: string
//   org_email?: string | null
//   org_phone?: string | null

//   org_img_name?: string | null
//   org_legal_name?: string | null
//   org_registration_number?: string | null
//   org_gst_number?: string | null

//   org_address_line1?: string | null
//   org_address_line2?: string | null
//   org_city?: string | null
//   org_state?: string | null
//   org_country?: string | null
//   org_pincode?: string | null

//   org_status?: OrganizationStatus
//   org_timezone?: string
// }
// export interface CreateOrganizationInput {
//   org_name: string
// user_name:string
//   org_img_name?: string | null
//   org_legal_name?: string | null
//   org_registration_number?: string | null
//   org_gst_number?: string | null

//   org_email?: string | null
//   org_phone?: string | null

//   org_address_line1?: string | null
//   org_address_line2?: string | null

//   org_city?: string | null
//   org_state?: string | null
//   org_country?: string | null
//   org_pincode?: string | null

//   org_status?: string
//   org_timezone?: string

//   order: {
//     item_type: "plan" | "bundle"

//     plan_id?: number
//     bundle_id?: number

//     item_name: string
//     item_code: string

//     license_type: string

//     quantity: number

//     unit_price: number
//     gst_percentage: number

//     start_date?: string | null
//     end_date?: string | null

//     payment_method: string

//     manual_payment_mode?: string | null
//     manual_payment_reference?: string | null
//     manual_payment_date?: string | null
   

//     note?: string | null
//   }
// }

export interface CreateOrganizationOrderItem {
  plan_id?: number
  bundle_id?: number

  item_name: string
  item_code: string

  license_type: string

  quantity: number

  unit_price: number
  gst_percentage: number

  start_date?: string | null
  end_date?: string | null
}

export interface CreateOrganizationInput {
  org_name: string
  user_name: string

  org_img_name?: string | null
  org_legal_name?: string | null
  org_registration_number?: string | null
  org_gst_number?: string | null

  org_email?: string | null
  org_phone?: string | null

  org_address_line1?: string | null
  org_address_line2?: string | null

  org_city?: string | null
  org_state?: string | null
  org_country?: string | null
  org_pincode?: string | null

  org_status?: OrganizationStatus
  org_timezone?: string

  order: {
    item_type: "plan" | "bundle"

    items: CreateOrganizationOrderItem[]

    payment_method: "manual"

    manual_payment_mode?: string | null
    manual_payment_reference?: string | null
    manual_payment_date?: string | null

    billing_name: string
    billing_email: string
    billing_address: string
    billing_address2?: string | null
    billing_city: string
    billing_state: string
    billing_country: string
    billing_pincode: string

    start_date?: string | null
    note?: string | null
  }
}



export interface CreateOrganizationOrderItem {
  plan_id?: number
  bundle_id?: number

  item_name: string
  item_code: string

  license_type: string

  quantity: number

  unit_price: number
  gst_percentage: number

  start_date?: string | null
  end_date?: string | null
}

export interface CreateOrganizationInput {
  org_name: string
  user_name: string

  org_img_name?: string | null
  org_legal_name?: string | null
  org_registration_number?: string | null
  org_gst_number?: string | null

  org_email?: string | null
  org_phone?: string | null

  org_address_line1?: string | null
  org_address_line2?: string | null

  org_city?: string | null
  org_state?: string | null
  org_country?: string | null
  org_pincode?: string | null

  org_status?: OrganizationStatus
  org_timezone?: string

  order: {
    item_type: "plan" | "bundle"

    items: CreateOrganizationOrderItem[]

    payment_method: "manual"

    manual_payment_mode?: string | null
    manual_payment_reference?: string | null
    manual_payment_date?: string | null

    billing_name: string
    billing_email: string
    billing_address: string
    billing_address2?: string | null
    billing_city: string
    billing_state: string
    billing_country: string
    billing_pincode: string

    start_date?: string | null
    note?: string | null
  }
}










export interface UpdateOrganizationInput {
  org_name?: string
  org_email?: string | null
  org_phone?: string | null

  org_img_name?: string | null
  org_legal_name?: string | null
  org_registration_number?: string | null
  org_gst_number?: string | null

  org_address_line1?: string | null
  org_address_line2?: string | null
  org_city?: string | null
  org_state?: string | null
  org_country?: string | null
  org_pincode?: string | null

  org_status?: OrganizationStatus
  org_timezone?: string
}

export interface RegisterOrganizationInput {
  organization: {
    org_name: string
    contact_person_name: string
    email: string
    phone: string
  }

  selection: {
    type: RegistrationSelectionType

    plan_ids?: number[]

    bundle_id?: number
  }

  pricing: {
    items: RegistrationPricingItem[]
  }

  payment: {
    payment_method: "manual"
    manual_payment_mode?: string
    payment_date: string
    payment_reference: string
  }
}

export interface RegistrationPricingItem {
  item_type: "plan" | "bundle"

  plan_id?: number
  bundle_id?: number

  unit_price: number
  gst_percentage: number

  start_date?: string

  amc?: {
    start_date?: string
    end_date?: string
    amount?: number
    gst_percentage?: number
  }
}

export interface RegistrationResult {
  organization_id: number
  user_id: number
  order_id: number
  order_number: string
}