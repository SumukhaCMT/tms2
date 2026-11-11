
export type BookingType = "one_time";

export interface SevaBooking {
  id: number;
organization_id: number;
  temple_id: number;
  seva_id: number;
  deity_id: number;

  seva_name: string;
  seva_code: string;

  deity_name: string | null;
  deity_code: string | null;
  
  booking_type: BookingType;
  seva_amount: number | string;
  seva_gst_percent: number | string;
  booking_gst_amount: number | string;
  booking_total_amount: number | string;
  devotee_id: number | null;
  devotee_name: string;
  devotee_phone: string;
  devotee_email: string | null;

  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;

  booking_scheduled_date: string;
  booking_scheduled_time: string | null;

  booking_remark: string | null;
  booking_internal_note: string | null;
    booking_payment_status: string;
  booking_payment_method: string | null;
  booking_paid_at: string | null;
    booking_receipt_number: string | null;
  booking_receipt_generated_at: string | null;

  booking_status: string;
    created_by_user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Optional values if your GET API joins temple details.
  temp_name?: string | null;
}

export interface CreateSevaBookingPayload {
  temple_id?: number;
  booking_type: "one_time";

  devotee_id: number | null;
  devotee_name: string;
  devotee_phone: string;
  devotee_email: string | null;

  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;

  deity_name: string | null;
  deity_code: string | null;

  seva_code: string;

  booking_scheduled_date: string;
  booking_scheduled_time: string | null;

  booking_remark: string | null;
  booking_internal_note: string | null;
}

export type UpdateSevaBookingPayload =
  Partial<CreateSevaBookingPayload>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SevaBookingListQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface SevaBookingListResult {
  data: SevaBooking[];
  pagination: PaginationMeta;
}


// export type BookingType = "one_time";

// export interface SevaBooking {
//   id: number;
//   organization_id: number;
//   temple_id: number;

//   booking_type: BookingType;

//   devotee_id: number | null;
//   devotee_name: string;
//   devotee_phone: string;
//   devotee_email: string | null;
//   devotee_gotra: string | null;
//   devotee_rashi: string | null;
//   devotee_nakshatra: string | null;

//   deity_name: string | null;
//   deity_code: string | null;

//   seva_name: string;
//   seva_code: string;

//   seva_amount: number | string;
//   seva_gst_percent: number | string;
//   booking_gst_amount: number | string;
//   booking_total_amount: number | string;

//   booking_scheduled_date: string;
//   booking_scheduled_time: string | null;

//   booking_payment_status: string;
//   booking_payment_method: string | null;
//   booking_paid_at: string | null;

//   booking_receipt_number: string | null;
//   booking_receipt_generated_at: string | null;

//   booking_status: string;

//   booking_remark: string | null;
//   booking_internal_note: string | null;

//   created_by_user_id: number;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;

//   // Optional values if your GET API joins temple details.
//   temp_name?: string | null;
// }

// export interface CreateSevaBookingPayload {
//   temple_id?: number;
//   booking_type: "one_time";

//   devotee_id: number | null;
//   devotee_name: string;
//   devotee_phone: string;
//   devotee_email: string | null;
//   devotee_gotra: string | null;
//   devotee_rashi: string | null;
//   devotee_nakshatra: string | null;

//   deity_name: string | null;
//   deity_code: string | null;
//   seva_code: string;

//   booking_scheduled_date: string;
//   booking_scheduled_time: string | null;

//   booking_remark: string | null;
//   booking_internal_note: string | null;
// }

// export type UpdateSevaBookingPayload =
//   Partial<CreateSevaBookingPayload>;

// export interface PaginationMeta {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// export interface SevaBookingListQuery {
//   page: number;
//   limit: number;
//   search?: string;
// }

// export interface SevaBookingListResult {
//   data: SevaBooking[];
//   pagination: PaginationMeta;
// }
