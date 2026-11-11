import api from "@/axios/axios"

export interface ContactModule {
  id: number
  name: string
  subModules: { id: number; code: string; name: string }[]
}

export interface ContactEnquiry {
  id: number
  user_name: string
  user_email: string | null
  user_phone: string | null
  org_name: string | null
  temp_name: string | null
  module_name: string | null
  subject: string
  message: string
  resolved_at: string | null
  created_at: string
}

export interface ContactPayload {
  sub_module_id: number | null
  other: string | null
  subject: string
  message: string
}

export const getContactModules = async (): Promise<ContactModule[]> => {
  const modules: ContactModule[] = (await api.get("/v1/modules/sidebar")).data?.data ?? []
  return modules
    .map((mod) => ({ ...mod, subModules: mod.subModules.filter((sm) => sm.code !== "contact") }))
    .filter((mod) => mod.subModules.length > 0)
}

export type ContactStatus = "pending" | "resolved"

export const getContacts = async (page: number, limit: number, status?: ContactStatus) =>
  (await api.get("/v1/contact", { params: { page, limit, status } })).data as {
    data: ContactEnquiry[]
    pagination: { total: number; totalPages: number }
  }

export const createContact = async (payload: ContactPayload) =>
  (await api.post("/v1/contact", payload)).data as { message: string }

export const updateContactStatus = async (id: number, status: ContactStatus) =>
  (await api.patch(`/v1/contact/${id}/status`, { status })).data as { message: string }
