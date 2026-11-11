export interface SystemDefault {
  id: number
  key_name: string
  value_int: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface CreateSystemDefaultPayload {
  key_name: string
  value_int: number
  description?: string
}

export interface UpdateSystemDefaultPayload {
  value_int: number
  description?: string
}

export interface SystemDefaultListParams {
  page?: number
  limit?: number
  search?: string
}

export interface SystemDefaultListResponse {
  success: boolean
  message: string
  data: SystemDefault[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SystemDefaultResponse {
  success: boolean
  message: string
  data: SystemDefault
}