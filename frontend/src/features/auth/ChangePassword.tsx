import { useState } from "react"
import type {  ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { ChangePasswordNew } from "@/types/ChangePasswordNew"
import type { FormErrors } from "@/types/ChangePasswordErrors"

import { validateChangePassword } from "@/utils/validateChangePasswordForm"
// import axios from "axios"
import axios from "@/axios/axios"
import { toast } from "sonner"
import { secureStorage } from "@/utils/secureStorage"

export default function ChangePassword() {
  const [formData, setFormData] = useState<ChangePasswordNew>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = validateChangePassword(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)

      const token = secureStorage.getItem("token")

      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }

      await axios.put(
        "/auth/change-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    

      toast.success("Password updated successfully - please log in again")

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setErrors({})

    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update password"

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="space-y-2">
            <Label>Old Password *</Label>
            <Input
              name="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <p className="text-sm text-red-500">{errors.oldPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>New Password *</Label>
            <Input
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirm Password *</Label>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </div>
  )
}
