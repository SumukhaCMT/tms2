export type ModuleType =
  | "capacity"
  | "consumable"
  | "feature"

export type CapacityType =
  | "users"
  | "temples"

export type ConsumableType =
  | "sms"
  | "email"
  | "whatsapp"

export type ModuleStatus =
  | "active"
  | "inactive"

export interface Module {
  id: number
  module_code: string
  module_name: string
  module_type: ModuleType
  capacity_type: CapacityType | null
  consumable_type: ConsumableType | null
  display_order: number
  status: ModuleStatus
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface CreateModuleData {
  module_code: string
  module_name: string
  module_type: ModuleType
  capacity_type?: CapacityType | null
  consumable_type?: ConsumableType | null
  display_order?: number
  status?: ModuleStatus
}

export interface UpdateModuleData {
  module_code?: string
  module_name?: string
  module_type?: ModuleType
  capacity_type?: CapacityType | null
  consumable_type?: ConsumableType | null
  display_order?: number
  status?: ModuleStatus
}