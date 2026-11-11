
export interface CreateSevaBookingInput {
  temple_id?: number;
  booking_type?: "one_time";

  devotee_id?: number | null;
  devotee_name?: string | null;
  devotee_phone?: string | null;
  devotee_email?: string | null;
  devotee_gotra?: string | null;
  devotee_rashi?: string | null;
  devotee_nakshatra?: string | null;

  deity_name?: string | null;
  deity_code?: string | null;

  seva_code: string;

  booking_scheduled_date: string;
  booking_scheduled_time?: string | null;

  booking_remark?: string | null;
  booking_internal_note?: string | null;
}

export interface UpdateSevaBookingInput {
  devotee_id?: number | null;
  devotee_name?: string | null;
  devotee_phone?: string | null;
  devotee_email?: string | null;
  devotee_gotra?: string | null;
  devotee_rashi?: string | null;
  devotee_nakshatra?: string | null;

  booking_scheduled_date?: string;
  booking_scheduled_time?: string | null;

  booking_remark?: string | null;
  booking_internal_note?: string | null;
}

export interface ListSevaBookingsQuery {
  page: number;
  limit: number;
  search: string;
  temple_id?: number;

  booking_payment_status?: "pending" | "paid" | "failed" | "refunded";

  booking_status?: "booked" | "confirmed" | "completed" | "cancelled";

  from_date?: string;
  to_date?: string;
}

export interface SevaBooking {
  id: number;
  organization_id: number;
  temple_id: number;

  booking_type: "one_time";

  devotee_id: number | null;
  devotee_name: string | null;
  devotee_phone: string | null;
  devotee_email: string | null;
  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;

  deity_name: string | null;
  deity_code: string | null;

  seva_name: string;
  seva_code: string | null;
  seva_amount: number;
  seva_gst_percent: number;
  booking_gst_amount: number;
  booking_total_amount: number;

  booking_scheduled_date: string;
  booking_scheduled_time: string | null;

  booking_payment_status: "pending" | "paid" | "failed" | "refunded";
  booking_payment_method: string | null;
  booking_paid_at: Date | null;

  booking_receipt_number: string | null;
  booking_receipt_generated_at: Date | null;

  booking_status: "booked" | "confirmed" | "completed" | "cancelled";

  booking_remark: string | null;
  booking_internal_note: string | null;

  created_by_user_id: number;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface SevaBookingListResult {
  data: SevaBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SevaBookingScope {
  temple_id: number;
  created_by_user_id: number;
}

export interface UpdateSevaBookingPaymentInput {
  booking_payment_status: "pending" | "paid" | "failed" | "refunded";
  booking_payment_method?: string | null;
}

export type SevaBookingStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled";

  export interface SevaBookingReportQuery {
  from_date: string;
  to_date: string;
  format: "excel" | "pdf";
  temple_id?: number;
}

export interface SevaBookingReportSummary {
  total_bookings: number;
  total_seva_amount: number;
  total_gst_amount: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
}