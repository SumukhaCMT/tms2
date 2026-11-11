
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
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateDeityInput {
  organization_id: number;
  temple_id: number;
  deity_name: string;
  deity_img_name?: string | null;
  // deity_code: string;
  deity_description?: string | null;
  deity_is_default?: DeityDefault;
  deity_display_order?: number;
  deity_status?: DeityStatus;
}

export interface UpdateDeityInput {
  temple_id?: number;
  deity_name?: string;
  deity_img_name?: string | null;
  deity_code?: string;
  deity_description?: string | null;
  deity_is_default?: DeityDefault;
  deity_display_order?: number;
  deity_status?: DeityStatus;
} 