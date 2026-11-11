import type { ChangePasswordNew } from "@/types/ChangePasswordNew"
import type { FormErrors } from "@/types/ChangePasswordErrors"

export const validateChangePassword = (data: ChangePasswordNew): FormErrors => {
  const errors: FormErrors = {}
  if (!data.oldPassword) errors.oldPassword = "Old password is required"
  if (!data.newPassword) errors.newPassword = "New password is required"
  else if (data.newPassword.length < 8) errors.newPassword = "Minimum 8 characters"
  else if (data.newPassword === data.oldPassword) errors.newPassword = "New password must differ from old"
  if (data.confirmPassword !== data.newPassword) errors.confirmPassword = "Passwords do not match"
  return errors
}
