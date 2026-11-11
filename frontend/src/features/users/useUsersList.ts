import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { PAGE_SIZE, apiMessage, type UserApiRow, type UserLimit } from "./usersTypes"
import { bulkDelete } from "@/utils/bulkDelete"
import { confirmDelete } from "@/components/confirm-delete"

export function useUsersList() {
  const [users, setUsers] = useState<UserApiRow[]>([])
  const [limit, setLimit] = useState<UserLimit | null>(null)
  const [statuses, setStatuses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState<"list" | "grid">("list")
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  function loadLimit() {
    return api.get("/v1/org-users/limit").then((res) => setLimit(res.data?.data ?? null))
  }

  useEffect(() => {
    Promise.all([api.get("/v1/org-users/statuses"), loadLimit()])
      .then(([statusRes]) => setStatuses(statusRes.data?.data ?? []))
      .catch(() => showCmtToast("expiry", "Failed to load users. Please try again."))
  }, [])

  useEffect(() => {
    api
      .get("/v1/org-users", { params: search ? { search } : undefined })
      .then((res) => setUsers(res.data?.data ?? []))
      .catch(() => showCmtToast("expiry", "Failed to load users. Please try again."))
      .finally(() => setIsLoading(false))
  }, [search])

  function handleSearch(value: string) {
    setIsLoading(true)
    setSearch(value)
    setCurrentPage(1)
  }

  const limitReached = !limit || limit.remaining <= 0
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentUsers = users.slice(startIndex, endIndex)

  function handleStatusChange(user: UserApiRow, status: string) {
    if (status === user.user_status) return
    setUpdatingId(user.id)
    api
      .patch(`/v1/org-users/${user.id}/status`, { user_status: status })
      .then(() => {
        setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, user_status: status } : item)))
        showCmtToast("success", "User status updated.")
        return loadLimit()
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to update status.")))
      .finally(() => setUpdatingId(null))
  }

  async function handleDelete(user: UserApiRow) {
    if (!(await confirmDelete(`Delete user ${user.user_name}? This cannot be undone.`, "Delete user?"))) return
    api
      .delete(`/v1/org-users/${user.id}`)
      .then(() => {
        setUsers((prev) => prev.filter((item) => item.id !== user.id))
        showCmtToast("success", "User deleted successfully.")
        return loadLimit()
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to delete the user.")))
  }

  async function handleBulkDelete(ids: number[]) {
    const names = users.filter((item) => ids.includes(item.id)).map((item) => `${item.user_code} · ${item.user_name}`)
    const deleted = await bulkDelete(ids, "/v1/org-users", "users", names)
    if (!deleted.length) return false
    setUsers((prev) => prev.filter((item) => !deleted.includes(item.id)))
    void loadLimit()
    return true
  }

  return {
    users,
    limit,
    limitReached,
    statuses,
    isLoading,
    currentPage: safePage,
    view,
    setView,
    updatingId,
    totalPages,
    startIndex,
    endIndex,
    currentUsers,
    handlePageChange: setCurrentPage,
    handlePrevPage: () => setCurrentPage((page) => Math.max(1, page - 1)),
    handleNextPage: () => setCurrentPage((page) => Math.min(totalPages, page + 1)),
    handleStatusChange,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch,
  }
}
