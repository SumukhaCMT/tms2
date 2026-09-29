import type { RegisterOrganization } from "@/types/RegisterOrganization"
import type { RegisterOrganizationErrors } from "@/types/RegisterOrganizationErrors"

export function validateRegisterOrganization(
  data: RegisterOrganization
): RegisterOrganizationErrors {
  const errors: RegisterOrganizationErrors = {}

  if (!data.organization_name.trim())
    errors.organization_name = "Organization name is required"
  if (!data.temple_name.trim()) errors.temple_name = "Temple name is required"
  if (!data.user_name.trim()) errors.user_name = "Name is required"

  if (!data.user_email.trim()) {
    errors.user_email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.user_email.trim())) {
    errors.user_email = "Enter a valid email address"
  }

  if (!data.user_phone.trim()) {
    errors.user_phone = "Phone number is required"
  } else if (!/^[6-9]\d{9}$/.test(data.user_phone.replace(/\D/g, "").slice(-10))) {
    errors.user_phone = "Enter a valid 10-digit phone number"
  }

  return errors
}
