import { useEffect, useState } from "react"
import { z } from "zod"

import api from "@/axios/axios"
import { useAuth } from "@/features/auth/useAuth"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import type { DeityOption, TempleOption } from "./shared/hundiFormTypes"
import { emptyDefineHundiForm, type DefineHundiApiRow, type DefineHundiForm, type FormErrors } from "./defineHundiTypes"
import { confirmDelete } from "@/components/confirm-delete"
import { bulkDelete } from "@/utils/bulkDelete"

const defineHundiSchema = z.object({
  deityId: z.string().trim().min(1, "Select a deity"),
  hundiNumber: z.string().trim().min(1, "Hundi number is required"),
  hundiName: z.string().trim().min(1, "Hundi name is required"),
})

export function useDefineHundiTable() {
  const { user } = useAuth()

  const isOrgAdmin = !!user?.organization_id && !user?.temple_id

  const canAdd = usePermission("hundi", "ADD")
  const canEdit = usePermission("hundi", "EDIT")
  const canDelete = usePermission("hundi", "DELETE")

  const [rows, setRows] = useState<DefineHundiApiRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [deities, setDeities] = useState<DeityOption[]>([])

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<DefineHundiForm>(() => emptyDefineHundiForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  const effectiveTempleId = isOrgAdmin ? (Number(form.templeId) || null) : (user?.temple_id ?? null)

  async function loadRows() {
    setIsLoading(true)
    try {
      const res = await api.get("/v1/define-hundi", { params: search ? { search } : undefined })
      const data = res?.data?.data
      if (Array.isArray(data)) setRows(data)
    } catch (error) {
      console.error("GET DEFINE HUNDIS ERROR:", error)
      showCmtToast("expiry", "Failed to load defined hundis. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadInitialRows() {
      setIsLoading(true)
      try {
        const res = await api.get("/v1/define-hundi", { params: search ? { search } : undefined })
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setRows(data)
      } catch (error) {
        console.error("GET DEFINE HUNDIS ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load defined hundis. Please try again.")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadInitialRows()

    return () => {
      isCancelled = true
    }
  }, [search])

  useEffect(() => {
    if (!isOrgAdmin) return
    let active = true
    async function loadTemples() {
      try {
        const res = await api.get("/v1/define-hundi/temples")
        const data = res?.data?.data
        if (active && Array.isArray(data)) setTemples(data)
      } catch {
        void 0
      }
    }
    loadTemples()
    return () => {
      active = false
    }
  }, [isOrgAdmin])

  useEffect(() => {
    let active = true
    async function loadDeities() {
      if (effectiveTempleId === null) {
        setDeities([])
        return
      }
      try {
        const res = await api.get("/v1/define-hundi/deities", {
          params: isOrgAdmin ? { temple_id: effectiveTempleId } : undefined,
        })
        const data = res?.data?.data
        if (active && Array.isArray(data)) setDeities(data)
      } catch {
        void 0
      }
    }
    loadDeities()
    return () => {
      active = false
    }
  }, [effectiveTempleId, isOrgAdmin])

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm<K extends keyof DefineHundiForm>(field: K, value: DefineHundiForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearError(field)
    if (field === "templeId") {
      setForm((prev) => ({ ...prev, deityId: "" }))
    }
  }

  function openAddSheet(preset: Partial<DefineHundiForm> = {}) {
    setEditingId(null)
    setForm({ ...emptyDefineHundiForm(), ...preset })
    setErrors({})
    setSheetOpen(true)
  }

  function openEditSheet(row: DefineHundiApiRow) {
    setEditingId(row.id)
    setForm({
      templeId: String(row.temple_id),
      deityId: String(row.deity_id),
      hundiNumber: row.hundi_number,
      hundiName: row.hundi_name,
      status: row.status,
    })
    setErrors({})
    setSheetOpen(true)
  }

  function closeSheet() {
    setSheetOpen(false)
  }

  function validate(): boolean {
    const result = defineHundiSchema.safeParse(form)
    const fieldErrors: FormErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
    }
    if (isOrgAdmin && !form.templeId) {
      fieldErrors.templeId = "Please select a temple"
    }
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        temple_id: isOrgAdmin ? Number(form.templeId) : undefined,
        deity_id: Number(form.deityId),
        hundi_number: form.hundiNumber.trim(),
        hundi_name: form.hundiName.trim(),
        status: form.status,
      }

      if (editingId) {
        await api.put(`/v1/define-hundi/${editingId}`, payload)
        showCmtToast("success", "Hundi updated successfully.")
      } else {
        await api.post("/v1/define-hundi", payload)
        showCmtToast("success", "Hundi defined successfully.")
      }

      setSheetOpen(false)
      await loadRows()
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to save the hundi. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(row: DefineHundiApiRow) {
    const confirmed = await confirmDelete(`Delete ${row.hundi_number} - ${row.hundi_name}? This cannot be undone.`, "Delete hundi?")
    if (!confirmed) return

    try {
      await api.delete(`/v1/define-hundi/${row.id}`)
      setRows((prev) => prev.filter((existing) => existing.id !== row.id))
      showCmtToast("success", "Hundi deleted successfully.")
    } catch (error) {
      console.error("DELETE DEFINE HUNDI ERROR:", error)
      showCmtToast("expiry", "Failed to delete the hundi. Please try again.")
    }
  }

  async function handleBulkDelete(ids: number[]) {
    const names = rows.filter((row) => ids.includes(row.id)).map((row) => `${row.hundi_number} - ${row.hundi_name}`)
    const deleted = await bulkDelete(ids, "/v1/define-hundi", "hundis", names)
    if (deleted.length) setRows((prev) => prev.filter((row) => !deleted.includes(row.id)))
    return deleted.length > 0
  }

  return {
    isOrgAdmin,
    canAdd,
    canEdit,
    canDelete,
    rows,
    isLoading,
    temples,
    deities,
    sheetOpen,
    setSheetOpen,
    editingId,
    form,
    errors,
    submitting,
    updateForm,
    openAddSheet,
    openEditSheet,
    closeSheet,
    handleSubmit,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch: setSearch,
  }
}
