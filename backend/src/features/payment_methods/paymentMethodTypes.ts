
export type PaymentMethodType =
  | "online"
  | "offline";

export type PaymentMethodDefault =
  | "yes"
  | "no";

export type PaymentMethodStatus =
  | "active"
  | "inactive";

export interface PaymentMethod {
  id: number;
  organization_id: number;
  temple_id: number;
    temple_name: string | null;
  payment_method: string;
  payment_method_type: PaymentMethodType;
  remark: string | null;
  is_default: PaymentMethodDefault;
  display_order: number;
  status: PaymentMethodStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentMethodInput {
  organization_id: number;
  temple_id: number;
 
  payment_method: string;
  payment_method_type: PaymentMethodType;
  remark?: string | null;
  is_default?: PaymentMethodDefault;
  display_order?: number;
  status?: PaymentMethodStatus;
}

export interface UpdatePaymentMethodInput {
  temple_id?: number;
  
  payment_method?: string;
  payment_method_type?: PaymentMethodType;
  remark?: string | null;
  is_default?: PaymentMethodDefault;
  display_order?: number;
  status?: PaymentMethodStatus;
}



