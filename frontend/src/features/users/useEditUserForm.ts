import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { detailsSchema } from "./useAddUserForm"
import {
  apiMessage,
  emptyTransferForm,
  toEditUserForm,
  type EditUserForm,
  type FormErrors,
  type RoleOption,
  type TempleOption,
  type TransferForm,
  type UserDetails,
} from "./usersTypes"

const transferSchema = z.object({
  toTempleId: z.string().min(1, "Select a new temple"),
  transferReason: z.string().trim().min(3, "Transfer reason must be at least 3 characters").max(500),
})

const collectErrors = (schema: z.ZodType, data: unknown) => {
  const result = schema.safeParse(data)
  const fieldErrors: FormErrors = {}
  if (!result.success) result.error.issues.forEach((issue) => (fieldErrors[String(issue.path[0])] ??= issue.message))
  return fieldErrors
}

export function useEditUserForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState<UserDetails | null>(null)
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<EditUserForm | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [transfer, setTransfer] = useState<TransferForm>(emptyTransferForm)
  const [transferErrors, setTransferErrors] = useState<FormErrors>({})
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/v1/org-users/${id}`), api.get("/v1/org-users/temples"), api.get("/v1/org-users/statuses"), api.get("/v1/org-users/roles")])
      .then(([userRes, templeRes, statusRes, roleRes]) => {
        setUser(userRes.data.data)
        setForm(toEditUserForm(userRes.data.data))
        setTemples(templeRes.data?.data ?? [])
        setStatuses(statusRes.data?.data ?? [])
        setRoles((roleRes.data?.data ?? []).map((role: { id: number; user_role_name: string }) => ({ value: String(role.id), label: role.user_role_name })))
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to load user. Please try again.")))
      .finally(() => setLoading(false))
  }, [id])

  function updateForm<K extends keyof EditUserForm>(field: K, value: EditUserForm[K]) {
    setForm((prev) => prev && { ...prev, [field]: value })
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function updateTransfer<K extends keyof TransferForm>(field: K, value: TransferForm[K]) {
    setTransfer((prev) => ({ ...prev, [field]: value }))
    setTransferErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function handleSave() {
    if (!form) return
    const fieldErrors = collectErrors(detailsSchema, form)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) return
    setSaving(true)
    api
      .put(`/v1/org-users/${id}`, {
        user_name: form.userName.trim(),
        user_email: form.userEmail.trim(),
        user_phone: form.userPhone.trim(),
        role_id: Number(form.roleId),
        designation_name: form.designationName.trim(),
        user_status: form.userStatus,
      })
      .then(() => {
        showCmtToast("success", "User updated successfully.")
        navigate("/users")
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to update the user. Please try again.")))
      .finally(() => setSaving(false))
  }

  function handleTransfer() {
    const fieldErrors = collectErrors(transferSchema, transfer)
    setTransferErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) return
    setTransferring(true)
    api
      .post(`/v1/org-users/${id}/transfer`, { to_temple_id: Number(transfer.toTempleId), transfer_reason: transfer.transferReason.trim() })
      .then(() => {
        const temple = temples.find((item) => String(item.id) === transfer.toTempleId)
        setUser((prev) => prev && { ...prev, temple_id: Number(transfer.toTempleId), temp_name: temple?.temp_name ?? null })
        setTransfer(emptyTransferForm())
        showCmtToast("success", "Temple changed successfully.")
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to change temple. Please try again.")))
      .finally(() => setTransferring(false))
  }

  const templeOptions = temples
    .filter((temple) => temple.id !== user?.temple_id)
    .map((temple) => ({ value: String(temple.id), label: temple.temp_name }))

  return {
    user,
    statuses,
    roles,
    loading,
    form,
    errors,
    saving,
    transfer,
    transferErrors,
    transferring,
    templeOptions,
    updateForm,
    updateTransfer,
    handleSave,
    handleTransfer,
  }
}
