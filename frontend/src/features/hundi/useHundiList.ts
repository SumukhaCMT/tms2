import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { toTime, useSort, type SortState } from "@/hooks/useSort"
import { bulkDelete } from "@/utils/bulkDelete"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { MAX_IMAGE_SIZE } from "@/utils/imageUpload"
import { usePermission } from "@/permissions/usePermission"

import { PAGE_SIZE, type HundiApiRow, type HundiRow } from "./hundiListTypes"
import { confirmDelete } from "@/components/confirm-delete"

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  const datePart = parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  const timePart = parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  return `${datePart}, ${timePart}`
}

function mapHundiRow(row: HundiApiRow): HundiRow {
  return {
    id: row.id,
    dbId: row.id,
    templeName: row.temp_name,
    deityName: row.deity_name,
    hundiNumber: row.hundi_number,
    hundiName: row.hundi_name,
    witnessName: row.witness_full_name,
    totalCash: Number(row.total_cash) || 0,
    openedAt: formatDateTime(row.opened_at),
    openedAtRaw: row.opened_at,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    createdByName: row.created_by_name,
    hasSignedReceipt: Boolean(Number(row.has_signed_receipt)),
  }
}

export function useHundiList() {
  const [hundis, setHundis] = useState<HundiRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [uploadingSignedId, setUploadingSignedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const canAdd = usePermission("hundi", "ADD")
  const canEdit = usePermission("hundi", "EDIT")
  const canDelete = usePermission("hundi", "DELETE")

  useEffect(() => {
    let isCancelled = false

    async function loadHundis() {
      setIsLoading(true)
      try {
        const response = await api.get("/v1/hundi", { params: search ? { search } : undefined })
        const rows = (response.data?.data ?? []) as HundiApiRow[]
        if (!isCancelled) setHundis(rows.map(mapHundiRow))
      } catch (error) {
        console.error("GET HUNDIS ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load hundis. Please try again.")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadHundis()

    return () => {
      isCancelled = true
    }
  }, [search])

  function handleSearch(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  const { sorted, sort, setSort } = useSort(hundis, {
    openedAt: (row) => toTime(row.openedAtRaw),
    date: (row) => toTime(row.createdAt),
  })
  const totalPages = Math.max(1, Math.ceil(hundis.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentHundis = sorted.slice(startIndex, endIndex)

  function handleSort(next: SortState | null) {
    setSort(next)
    setCurrentPage(1)
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  function handlePrevPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  async function handleBulkDelete(ids: number[]) {
    const names = hundis.filter((item) => ids.includes(item.dbId)).map((item) => `${item.hundiNumber} - ${item.hundiName} · ${item.openedAt}`)
    const deleted = await bulkDelete(ids, "/v1/hundi", "hundi openings", names)
    if (deleted.length) setHundis((prev) => prev.filter((item) => !deleted.includes(item.dbId)))
    return deleted.length > 0
  }

  async function handleDelete(hundi: HundiRow) {
    const confirmed = await confirmDelete(
      `Delete the ${hundi.hundiName} opening recorded on ${hundi.openedAt}? This cannot be undone.`,
      "Delete hundi opening?",
    )
    if (!confirmed) return

    try {
      await api.delete(`/v1/hundi/${hundi.dbId}`)
      setHundis((prev) => prev.filter((row) => row.dbId !== hundi.dbId))
      showCmtToast("success", "Hundi deleted successfully.")
    } catch (error) {
      console.error("DELETE HUNDI ERROR:", error)
      showCmtToast("expiry", "Failed to delete the hundi. Please try again.")
    }
  }

  async function handleDownloadReceipt(hundi: HundiRow) {
    setDownloadingId(hundi.dbId)
    try {
      const response = await api.get(`/v1/hundi/${hundi.dbId}/receipt`, { responseType: "blob" })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `Hundi-Receipt-${hundi.hundiNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error("DOWNLOAD HUNDI RECEIPT ERROR:", error)
      showCmtToast("expiry", "Failed to download the receipt. Please try again.")
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleUploadSignedReceipt(hundi: HundiRow, file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      showCmtToast("expiry", "Maximum file size is 5 MB.")
      return
    }
    setUploadingSignedId(hundi.dbId)
    try {
      const uploadData = new FormData()
      uploadData.append("signed_receipt", file)
      await api.post(`/v1/hundi/${hundi.dbId}/signed-receipt`, uploadData)
      setHundis((prev) =>
        prev.map((row) => (row.dbId === hundi.dbId ? { ...row, hasSignedReceipt: true } : row)),
      )
      showCmtToast("success", "Signed receipt uploaded successfully.")
    } catch (error) {
      console.error("UPLOAD HUNDI SIGNED RECEIPT ERROR:", error)
      showCmtToast("expiry", "Failed to upload the signed receipt. Please try again.")
    } finally {
      setUploadingSignedId(null)
    }
  }

  async function handleDownloadSignedReceipt(hundi: HundiRow) {
    try {
      const response = await api.get(`/v1/hundi/${hundi.dbId}/signed-receipt`, { responseType: "blob" })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, "_blank")
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error("DOWNLOAD HUNDI SIGNED RECEIPT ERROR:", error)
      showCmtToast("expiry", "Failed to load the signed receipt. Please try again.")
    }
  }

  return {
    hundis,
    isLoading,
    currentPage,
    downloadingId,
    uploadingSignedId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentHundis,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleDelete,
    handleBulkDelete,
    sort,
    handleSort,
    handleDownloadReceipt,
    handleUploadSignedReceipt,
    handleDownloadSignedReceipt,
    search,
    handleSearch,
  }
}
