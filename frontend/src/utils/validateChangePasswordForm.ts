import type { ChangePasswordNew } from "@/types/ChangePasswordNew"
import type { FormErrors } from "@/types/ChangePasswordErrors"

export function validateChangePassword(data: ChangePasswordNew): FormErrors {
  const errors: FormErrors = {}

  if (!data.oldPassword) errors.oldPassword = "Current password is required"

  if (!data.newPassword) {
    errors.newPassword = "New password is required"
  } else if (data.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters"
  } else if (
    !/[A-Z]/.test(data.newPassword) ||
    !/[a-z]/.test(data.newPassword) ||
    !/\d/.test(data.newPassword) ||
    !/[^A-Za-z0-9]/.test(data.newPassword)
  ) {
    errors.newPassword =
      "Password must include uppercase, lowercase, a number and a special character"
  } else if (data.newPassword === data.oldPassword) {
    errors.newPassword = "New password must differ from the current one"
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password"
  } else if (data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return errors
}
