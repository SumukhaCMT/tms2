


export type DeityStatus = "active" | "inactive";
export type DeityDefault = "yes" | "no";

export interface Deity {
  id: number;
  organization_id: number;
  temple_id: number;
  deity_name: string;
  deity_img_name: string | null;
  deity_code: string;
  deity_description: string | null;
  deity_is_default: DeityDefault;
  deity_display_order: number;
  deity_status: DeityStatus;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CreateDeityPayload {
  temple_id: number;
  deity_name: string;
  deity_img_name: string | null;
  deity_description: string | null;
  deity_is_default: DeityDefault;
  deity_display_order: number;
  deity_status: DeityStatus;
}

export type UpdateDeityPayload = Partial<CreateDeityPayload>;

export interface DeityApiResponse {
  success: boolean;
  message: string;
  data: Deity;
}

export interface DeitiesApiResponse {
  success: boolean;
  message: string;
  data: Deity[];
}
