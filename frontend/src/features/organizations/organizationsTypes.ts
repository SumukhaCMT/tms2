

/* =========================================================
   ORGANIZATION STATUS
========================================================= */

export type OrganizationStatus =
  | "active"
  | "inactive"

/* =========================================================
   ITEM TYPE
========================================================= */

export type OrganizationItemType =
  | "plan"
  | "bundle"

/* =========================================================
   LICENSE TYPE
========================================================= */

export type OrganizationLicenseType =
  | "subscription"
  | "perpetual"

/* =========================================================
   PAYMENT
========================================================= */

export type OrganizationPaymentMethod =
  | "manual"

export type ManualPaymentMode =
  | "upi"
  | "cash"
  | "bank_transfer"
  | "cheque"

/* =========================================================
   ORGANIZATION LIST
========================================================= */

export interface Organization {
  id: number

  org_name: string
  org_slug: string

  org_email: string | null
  org_phone: string | null
org_legal_name: string | null
org_registration_number: string | null
org_gst_number : string | null
org_address_line1 : string | null
created_at : string | null
  org_city: string | null

  org_status: OrganizationStatus

  users: number
  temples: number
}

/* =========================================================
   ORGANIZATION DETAILS
   Actual organization record
========================================================= */

export interface OrganizationDetails {
  id: number

  org_name: string

  org_img_name: string | null
  org_legal_name: string | null
  org_registration_number: string | null
  org_gst_number: string | null

  org_email: string | null
  org_phone: string | null

  org_address_line1: string | null
  org_address_line2: string | null

  org_city: string | null
  org_state: string | null
  org_country: string | null
  org_pincode: string | null

  org_slug: string
  org_status: OrganizationStatus
  org_timezone: string

  created_at: string
  updated_at: string

  deleted_at: string | null
   
  
  
}
export interface OrganizationDetailsData {
  organization: OrganizationDetails

  temples: OrganizationTemple[]

  users: OrganizationUser[]

  subscriptions: OrganizationSubscription[]

  orders: OrganizationOrder[]
}
export interface OrganizationResponse {
  success: boolean
  message?: string
  data: OrganizationDetailsData
}

/* =========================================================
   ORGANIZATION TEMPLE
========================================================= */

export interface OrganizationTemple {
  id: number
  organization_id: number

  temp_name: string

  temp_lat: number | null
  temp_lng: number | null

  temp_img_name: string | null
  temp_legal_name: string | null
  temp_registration_number: string | null
  temp_gst_number: string | null

  temp_email: string | null
  temp_phone: string | null

  temp_address_line1: string | null
  temp_address_line2: string | null

  temp_city: string | null
  temp_state: string | null
  temp_country: string | null
  temp_pincode: string | null

  temp_slug: string | null

  temp_is_primary: number
  temp_status: string
  temp_timezone: string

  created_at: string
  updated_at: string

  deleted_at: string | null
}

/* =========================================================
   ORGANIZATION USER
========================================================= */

export interface OrganizationUser {
  id: number
  organization_id: number
  temple_id: number | null

  user_code: string
  user_name: string

  user_email: string | null
  user_phone: string | null

  role_id: number

  user_status: string

  created_at: string
  updated_at: string
}

/* =========================================================
   ORGANIZATION SUBSCRIPTION
========================================================= */

export interface OrganizationSubscription {
  id: number
  organization_id: number

  subscription_type: OrganizationItemType

  plan_id: number | null
  bundle_id: number | null

  granted_quantity: number
  remaining_quantity: number

  license_type: OrganizationLicenseType

  is_free_trial: number

  start_date: string
  expiry_date: string | null

  subscription_status: string

  created_at: string
  updated_at: string
}

/* =========================================================
   ORGANIZATION ORDER ITEM
========================================================= */

export interface OrganizationOrderItem {
  id: number
  order_id: number

  item_type: OrganizationItemType

  plan_id: number | null
  bundle_id: number | null

  item_name: string
  item_code: string

  module_data: string | null

  license_type: OrganizationLicenseType

  quantity: number

  start_date: string | null
  end_date: string | null

  unit_price: string
  gst_percentage: string
  gst_amount: string
  line_total: string

  org_subscription_id: number | null

  created_at: string
  updated_at: string
}

/* =========================================================
   ORGANIZATION ORDER
========================================================= */

export interface OrganizationOrder {
  id: number
  organization_id: number

  organization_name: string
  placed_by_name: string

  order_number: string

  order_status: string
  payment_status: string

  payment_method: OrganizationPaymentMethod

  manual_payment_mode: ManualPaymentMode | null
  manual_payment_reference: string | null
  manual_payment_date: string | null
  manual_payment_recorded_by_name: string | null

  subtotal: string
  total_gst_amount: string
  grand_total: string

  currency: string

  /* ===============================
     BILLING
  =============================== */

  billing_name: string
  billing_gst_number: string | null

  billing_email: string | null
  billing_phone: string | null

  billing_address_line1: string | null
  billing_address_line2: string | null

  billing_city: string | null
  billing_state: string | null
  billing_country: string | null
  billing_pincode: string | null

  /* ===============================
     OTHER
  =============================== */

  note: string | null

  placed_at: string

  created_at: string
  updated_at: string

  items: OrganizationOrderItem[]
}

/* =========================================================
   ORGANIZATION DETAILS DATA
   Complete organization detail
========================================================= */

export interface OrganizationDetailsData {
  organization: OrganizationDetails

  temples: OrganizationTemple[]

  users: OrganizationUser[]

  subscriptions: OrganizationSubscription[]

  orders: OrganizationOrder[]
}

/* =========================================================
   ORGANIZATION DETAILS API RESPONSE
========================================================= */

export interface OrganizationResponse {
  success: boolean

  message?: string

  data: OrganizationDetailsData
}

/* =========================================================
   ORGANIZATION DETAILS RESPONSE ALIAS
   Optional alias if used elsewhere
========================================================= */

export type OrganizationDetailsResponse =
  OrganizationResponse

/* =========================================================
   ORGANIZATION LIST PARAMETERS
========================================================= */

export interface OrganizationListParams {
  page?: number
  limit?: number

  search?: string

  status?: OrganizationStatus | ""
}

/* =========================================================
   ORGANIZATION PAGINATION
========================================================= */

export interface OrganizationPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/* =========================================================
   ORGANIZATION LIST RESPONSE
========================================================= */

export interface OrganizationListResponse {
  success: boolean

  message?: string

  data: Organization[]

  pagination: OrganizationPagination
}

/* =========================================================
   CREATE ORDER ITEM
========================================================= */

export interface CreateOrganizationOrderItem {
  plan_id?: number
  bundle_id?: number

  item_name: string
  item_code: string

  license_type: OrganizationLicenseType

  quantity: number

  unit_price: number
  gst_percentage: number

  start_date?: string
  end_date?: string
}

/* =========================================================
   CREATE ORGANIZATION ORDER
========================================================= */

export interface CreateOrganizationOrder {
  item_type: OrganizationItemType

  items: CreateOrganizationOrderItem[]

  /* ===============================
     PAYMENT
  =============================== */

  payment_method: "manual"

  manual_payment_mode: ManualPaymentMode

  manual_payment_reference: string

  manual_payment_date: string

  start_date: string

  /* ===============================
     BILLING
  =============================== */

  billing_name: string
  billing_email: string

  billing_address: string
   billing_address2: string

   billing_state: string
   billing_country: string
   billing_pincode?: string
billing_city: string
  /* ===============================
     NOTE
  =============================== */

  note?: string
}

/* =========================================================
   CREATE ORGANIZATION PAYLOAD
========================================================= */

export interface CreateOrganizationPayload {
  org_name: string

  user_name: string

  org_email: string

  org_phone: string

  org_country: string

  order: CreateOrganizationOrder
}

/* =========================================================
   UPDATE ORGANIZATION
========================================================= */

// export interface UpdateOrganizationPayload {
//   id: number | string

//   name: string

//   code?: string

//   email: string

//   phone: string

//   city: string

//   status: OrganizationStatus
// }

export interface UpdateOrganizationPayload {
  id: number | string

  org_name?: string
  org_slug?: string
  org_timezone?: string
  org_status?: string
  org_country?: string

  org_email?: string
  org_phone?: string
  org_legal_name?: string

  org_registration_number?: string
  org_gst_number?: string

  org_address_line1?: string
  org_address_line2?: string
  org_city?: string
  org_state?: string
  org_pincode?: string
}


/* =========================================================
   SUBSCRIPTION UPDATE
========================================================= */

export interface UpdateOrganizationSubscriptionPayload {
  id: number | string

  granted_quantity?: number
  remaining_quantity?: number

  start_date?: string
  expiry_date?: string
}
/* =========================================================
   REGISTRATION ITEM TYPE
========================================================= */

export type RegistrationItemType =
  | "plan"
  | "bundle"

/* =========================================================
   REGISTRATION LICENSE TYPE
========================================================= */

export type RegistrationLicenseType =
  | "subscription"
  | "perpetual"

/* =========================================================
   REGISTRATION ORDER ITEM
========================================================= */

export interface RegistrationOrderItem {
  plan_id?: number
  bundle_id?: number

  item_name: string
  item_code: string

  license_type: RegistrationLicenseType

  quantity: number

  unit_price: number
  gst_percentage: number

  start_date?: string
  end_date?: string
}

/* =========================================================
   REGISTRATION ORDER
========================================================= */

export interface RegistrationOrder {
  item_type: RegistrationItemType

  items: RegistrationOrderItem[]

  /* ===============================
     PAYMENT
  =============================== */

  payment_method: "manual"

  manual_payment_mode: "upi"

  manual_payment_reference: string

  manual_payment_date: string

  start_date: string

  /* ===============================
     BILLING
  =============================== */

  billing_name: string
  billing_email: string

  billing_address: string
   billing_address2: string
  billing_pincode: string

  /* ===============================
     NOTE
  =============================== */

  note?: string
}

/* =========================================================
   CREATE ORGANIZATION REGISTRATION PAYLOAD
========================================================= */

export interface CreateOrganizationRegistrationPayload {
  org_name: string

  user_name: string

  org_email: string

  org_phone: string

  org_country: string

  order: RegistrationOrder
}

/* =========================================================
   CREATE ORGANIZATION REGISTRATION RESPONSE
========================================================= */

export interface CreateOrganizationRegistrationResponse {
  success: boolean

  message?: string

  data?: OrganizationDetailsData
}