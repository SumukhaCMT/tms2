import type { RegisterOrganization } from "./RegisterOrganization"

export type RegisterOrganizationErrors = Partial<
  Record<keyof RegisterOrganization | "form", string>
>
