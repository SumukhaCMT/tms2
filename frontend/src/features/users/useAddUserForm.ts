import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { apiMessage, emptyAddUserForm, type AddUserForm, type FormErrors, type RoleOption, type TempleOption } from "./usersTypes"

const templeSchema = z.object({
  templeId: z.string().min(1, "Select a temple"),
})

export const detailsSchema = z.object({
  userName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  userEmail: z.string().trim().email("Enter a valid email"),
  userPhone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  roleId: z.string().min(1, "Select a role"),
  designationName: z.string().trim().min(2, "Role name must be at least 2 characters").max(100),
  userStatus: z.string().min(1, "Select a status"),
})

const STEP_SCHEMAS: Record<number, z.ZodType> = { 1: templeSchema, 2: detailsSchema }

export function useAddUserForm() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<AddUserForm>(emptyAddUserForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    Promise.all([api.get("/v1/org-users/limit"), api.get("/v1/org-users/temples"), api.get("/v1/org-users/statuses"), api.get("/v1/org-users/roles")])
      .then(([limitRes, templeRes, statusRes, roleRes]) => {
        if ((limitRes.data?.data?.remaining ?? 0) <= 0) {
          showCmtToast("expiry", "User limit exceeded. Delete a user or buy more users.")
          navigate("/users", { replace: true })
          return
        }
        setTemples(templeRes.data?.data ?? [])
        setStatuses(statusRes.data?.data ?? [])
        setRoles((roleRes.data?.data ?? []).map((role: { id: number; user_role_name: string }) => ({ value: String(role.id), label: role.user_role_name })))
      })
      .catch(() => showCmtToast("expiry", "Failed to load form data. Please try again."))
      .finally(() => setLoading(false))
  }, [navigate])

  function updateForm<K extends keyof AddUserForm>(field: K, value: AddUserForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validate(currentStep: number) {
    const result = STEP_SCHEMAS[currentStep].safeParse(form)
    const fieldErrors: FormErrors = {}
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const key = String(issue.path[0])
        fieldErrors[key] ??= issue.message
      })
    }
    setErrors(fieldErrors)
    return result.success
  }

  function handleNext() {
    if (validate(step)) setStep(step + 1)
  }

  function handleBack() {
    setStep((prev) => Math.max(1, prev - 1))
  }

  function handleSubmit() {
    if (!validate(1)) return setStep(1)
    if (!validate(2)) return setStep(2)
    setSubmitting(true)
    api
      .post("/v1/org-users", {
        temple_id: Number(form.templeId),
        user_name: form.userName.trim(),
        user_email: form.userEmail.trim(),
        user_phone: form.userPhone.trim(),
        role_id: Number(form.roleId),
        designation_name: form.designationName.trim(),
        user_status: form.userStatus,
      })
      .then((res) => {
        setPassword(res.data?.data?.password ?? "")
        showCmtToast("success", "User created successfully.")
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to create the user. Please try again.")))
      .finally(() => setSubmitting(false))
  }

  function copyPassword() {
    void navigator.clipboard.writeText(password).then(() => showCmtToast("success", "Password copied."))
  }

  const templeName = temples.find((temple) => String(temple.id) === form.templeId)?.temp_name ?? ""

  return {
    step,
    temples,
    statuses,
    roles,
    loading,
    form,
    errors,
    submitting,
    password,
    templeName,
    updateForm,
    handleNext,
    handleBack,
    handleSubmit,
    copyPassword,
  }
}
