import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { toTime, useSort, type SortState } from "@/hooks/useSort"
import { bulkDelete } from "@/utils/bulkDelete"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import { PAGE_SIZE, type DonationApiRow, type Donor, type DonationListType } from "./donationsListTypes"
import { confirmDelete } from "@/components/confirm-delete"

function getDonationType(monetary: number, inkind: number): DonationListType {
  if (monetary && inkind) return "Both"
  if (inkind) return "In-Kind"
  return "Monetary"
}

function formatDate(value: string): string {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return "-"
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function mapDonationRow(row: DonationApiRow): Donor {
  return {
    id: row.donation_number,
    dbId: row.id,
    name: row.donor_name,
    phone: row.donor_phone ?? "-",
    email: row.donor_email ?? "-",
    city: row.donor_city ?? "-",
    state: row.donor_state ?? "-",
    type: getDonationType(row.monetary, row.inkind),
    storedAt: row.stored_at ?? "-",
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    templeName: row.temp_name,
    createdByName: row.created_by_name ?? "-",
  }
}

export function useDonationsList() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState<"list" | "grid">("list")
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const canAdd = usePermission("donations", "ADD")
  const canEdit = usePermission("donations", "EDIT")
  const canDelete = usePermission("donations", "DELETE")

  useEffect(() => {
    let isCancelled = false

    async function loadDonations() {
      setIsLoading(true)

      try {
        const response = await api.get("/v1/donations", { params: search ? { search } : undefined })
        const rows = (response.data?.data ?? []) as DonationApiRow[]

        if (!isCancelled) {
          setDonors(rows.map(mapDonationRow))
        }
      } catch (error) {
        console.error("GET DONATIONS ERROR:", error)

        if (!isCancelled) {
          showCmtToast("expiry", "Failed to load donations. Please try again.")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDonations()

    return () => {
      isCancelled = true
    }
  }, [search])

  function handleSearch(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  const { sorted, sort, setSort } = useSort(donors, { date: (row) => toTime(row.createdAt) })
  const totalPages = Math.max(1, Math.ceil(donors.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const currentDonors = sorted.slice(startIndex, endIndex)

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
    const names = donors.filter((item) => ids.includes(item.dbId)).map((item) => `${item.id} · ${item.name}`)
    const deleted = await bulkDelete(ids, "/v1/donations", "donations", names)
    if (deleted.length) setDonors((prev) => prev.filter((item) => !deleted.includes(item.dbId)))
    return deleted.length > 0
  }

  async function handleDelete(donor: Donor) {
    const confirmed = await confirmDelete(
      `Delete donation ${donor.id} from ${donor.name}? This cannot be undone.`,
      "Delete donation?",
    )

    if (!confirmed) return

    try {
      await api.delete(`/v1/donations/${donor.dbId}`)
      setDonors((prev) => prev.filter((item) => item.dbId !== donor.dbId))
      showCmtToast("success", "Donation deleted successfully.")
    } catch (error) {
      console.error("DELETE DONATION ERROR:", error)
      showCmtToast("expiry", "Failed to delete the donation. Please try again.")
    }
  }

  async function handleDownloadReceipt(donor: Donor) {
    setDownloadingId(donor.dbId)

    try {
      const response = await api.get(`/v1/donations/${donor.dbId}/receipt`, {
        responseType: "blob",
      })

      const blob = new Blob([response.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `Donation-Receipt-${donor.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error("DOWNLOAD DONATION RECEIPT ERROR:", error)
      showCmtToast("expiry", "Failed to download the receipt. Please try again.")
    } finally {
      setDownloadingId(null)
    }
  }

  return {
    donors,
    isLoading,
    currentPage,
    view,
    setView,
    downloadingId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentDonors,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleDelete,
    handleBulkDelete,
    sort,
    handleSort,
    handleDownloadReceipt,
    search,
    handleSearch,
  }
}
