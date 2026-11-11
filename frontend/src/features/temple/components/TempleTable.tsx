
"use client"

import { useEffect, useState } from "react"


import { NavLink } from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import type { AppDispatch } from "@/app/store"

import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ViewToggle ,{  type ViewMode } from "@/components/layout/ViewToggle"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { RowAction, RowActions } from "@/components/row-actions"
import { confirmDelete } from "@/components/confirm-delete"
import { useRowSelection } from "@/hooks/useRowSelection"
import { bulkDelete } from "@/utils/bulkDelete"

import { Input } from "@/components/ui/input";
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
  selectTempleDeleting,
} from "../templeSelectors"

import {
  fetchTemples,
  updateTemple,
  deleteTemple,
} from "../templeThunks"

import type { Temple } from "../templeTypes"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"

import { useModulePermissions } from "@/hooks/useModulePermissions";
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import api from "@/axios/axios"

const PAGE_SIZE = 10

export default function TempleTable() {
  const dispatch = useDispatch<AppDispatch>()
const {
  canAdd,
  canEdit,
  canDelete,
  canView,
} = useModulePermissions("temples");



  /* ================================================================
     REDUX DATA
     ================================================================ */

  const temples =
    useSelector(selectTemples) ?? []

  const loading = useSelector(
    selectTempleLoading,
  )

  const error = useSelector(
    selectTempleError,
  )

  const deleting = useSelector(
    selectTempleDeleting,
  )

  /* ================================================================
     LOCAL STATE
     ================================================================ */

  const [currentPage, setCurrentPage] =
    useState(1)

  // const [view, setView] = useState<
  //   "list" | "grid"
  // >("list")
const [view, setView] = useState<ViewMode>("list");
  const [templeLimit, setTempleLimit] = useState<{ limit: number; used: number; remaining: number } | null>(null)
  const limitReached = !templeLimit || templeLimit.remaining <= 0

  function loadLimit() {
    return api.get("/v1/temples/limit").then((res) => setTempleLimit(res.data?.data ?? null)).catch(() => setTempleLimit(null))
  }
  /* ================================================================
     DATA
     ================================================================ */

  const total = temples.length

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  )

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  )

  const paginatedTemples =
    temples.slice(
      (safeCurrentPage - 1) * PAGE_SIZE,
      safeCurrentPage * PAGE_SIZE,
    )

  /* ================================================================
     FETCH TEMPLES
     ================================================================ */

  const selection = useRowSelection(paginatedTemples.map((item) => item.id))

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof temples)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateTemple({ id: Number(item.id), data: { temp_status: status as typeof item.temp_status } })).unwrap()
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(fetchTemples())
    void loadLimit()
  }, [dispatch])

  /* ================================================================
     PAGINATION
     ================================================================ */

  const handlePageChange = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return
    }

    setCurrentPage(page)
  }

  /* ================================================================
     DELETE TEMPLE
     ================================================================ */

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete temple?"))) return
    const result = await dispatch(deleteTemple(id))
    if (deleteTemple.rejected.match(result)) {
      showCmtToast("expiry", result.payload ?? "Failed to delete temple.")
      return
    }
    showCmtToast("success", "Temple deleted successfully.")
    void dispatch(fetchTemples())
    void loadLimit()
  }

  const deleteSelected = async () => {
    const names = temples.filter((item) => selection.isSelected(item.id)).map((item) => item.temp_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteTemple(id)).unwrap(), "temples", names)
    if (!deleted.length) return
    selection.clear()
    void dispatch(fetchTemples())
    void loadLimit()
  }

  /* ================================================================
     LOADING
     ================================================================ */

  if (
    loading &&
    temples.length === 0
  ) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading temples...
        </p>
      </div>
    )
  }

  /* ================================================================
     ERROR
     ================================================================ */

  if (
    error &&
    temples.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          {error}
        </p>

        <Button
          className="mt-4 cursor-pointer"
          onClick={() => {
            void dispatch(
              fetchTemples(),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ================================================================
     DISPLAY RANGE
     ================================================================ */

  const firstItem =
    total === 0
      ? 0
      : (safeCurrentPage - 1) *
      PAGE_SIZE +
      1

  const lastItem = Math.min(
    safeCurrentPage * PAGE_SIZE,
    total,
  )

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="w-full space-y-4">

      {/* ============================================================
          HEADER
          ============================================================ */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          // value={search}
          // onChange={(event) => {
          //   setSearch(event.target.value);
          //   setPage(1);
          // }}
          placeholder="Search temple name or code..."
          className="w-full sm:w-64"
          aria-label="Search temple"
        />
        <div className="flex flex-wrap items-center gap-2">
         
        {canAdd && (limitReached ? (
          <Tooltip>
            <TooltipTrigger render={<span tabIndex={0} className="inline-flex cursor-not-allowed" />}>
              <Button disabled>Add Temple</Button>
            </TooltipTrigger>
            <TooltipContent>
              {templeLimit ? `Temple limit reached. Your organization can have a maximum of ${templeLimit.limit} temple(s).` : "Unable to verify temple limit."}
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink to="/temples/add">
            <Button className="cursor-pointer">
              Add Temple
            </Button>
          </NavLink>
        ))}
     

       
        
               <ViewToggle
    view={view}
    onViewChange={setView}
  />
     </div>
      </div>

      {canDelete && <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />}

      {/* ============================================================
          LIST VIEW
          ============================================================ */}

      {view === "list" && (
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "temple", label: "Temple", size: 10 },
            { id: "legal-name", label: "Legal Name", size: 10 },
            { id: "registration-no", label: "Registration No.", size: 10 },
            { id: "location", label: "Location", size: 10 },
            { id: "phone", label: "Phone", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "primary", label: "Primary", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>

            {paginatedTemples.length ===
              0 ? (
              <TableRow>

                <TableCell
                  colSpan={10}
                  className="h-24 text-center"
                >
                  No temples found.
                </TableCell>

              </TableRow>
            ) : (
              paginatedTemples.map(
                (
                  temple: Temple,
                  index,
                ) => (
                  <TableRow
                    key={temple.id}
                    data-state={selection.isSelected(temple.id) ? "selected" : undefined}
                  >

                    {canDelete && (
                      <TableCell>
                        <Checkbox checked={selection.isSelected(temple.id)} onCheckedChange={() => selection.toggle(temple.id)} aria-label="Select row" />
                      </TableCell>
                    )}

                    {/* Sl No */}

                    <TableCell>
                      {(safeCurrentPage -
                        1) *
                        PAGE_SIZE +
                        index +
                        1}
                    </TableCell>

                    {/* Temple */}

                    <TableCell>
                      <div>

                        <p className="font-medium">
                          {
                            temple.temp_name
                          }
                        </p>

                      </div>
                    </TableCell>

                    {/* Legal Name */}

                    <TableCell>
                      {
                        temple.temp_legal_name ||
                        "-"
                      }
                    </TableCell>

                    {/* Registration */}

                    <TableCell>
                      {
                        temple.temp_registration_number ||
                        "-"
                      }
                    </TableCell>

                    {/* Location */}

                    <TableCell>
                      <div>

                        <p>
                          {
                            temple.temp_city ||
                            "-"
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            temple.temp_state ||
                            "-"
                          }
                        </p>

                      </div>
                    </TableCell>

                    {/* Phone */}

                    <TableCell>
                      {
                        temple.temp_phone ||
                        "-"
                      }
                    </TableCell>

                    {/* Status */}

                    <TableCell>

                      <StatusSelect value={temple.temp_status} disabled={statusUpdatingId === temple.id} onChange={canEdit ? (status) => void changeStatus(temple, status) : undefined} />

                    </TableCell>

                    {/* Primary */}

                    <TableCell>
                      {temple.temp_is_primary
                        ? "Yes"
                        : "No"}
                    </TableCell>

                    {/* Actions */}

                    <TableCell>

                      <RowActions>
                        {canView && <RowAction type="view" to={`/temples/view/${temple.id}`} />}
                        {canEdit && <RowAction type="edit" to={`/temples/edit/${temple.id}`} />}
                        {canDelete && <RowAction type="delete" disabled={deleting} onClick={() => void handleDelete(temple.id, temple.temp_name)} />}
                      </RowActions>

                    </TableCell>

                  </TableRow>
                ),
              )
            )}

          </TableBody>

        </ResizableTable>
      )}

      {/* ============================================================
          GRID VIEW
          ============================================================ */}

      {view === "grid" && (
        <RecordCardGrid>
          {paginatedTemples.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No temples found.</div>
          ) : (
            paginatedTemples.map((temple: Temple, index) => (
              <RecordCard
                key={temple.id}
                index={(safeCurrentPage - 1) * PAGE_SIZE + index + 1}
                title={temple.temp_name}
                subtitle={temple.temp_legal_name || "-"}
                badge={
                  <StatusSelect value={temple.temp_status} disabled={statusUpdatingId === temple.id} onChange={canEdit ? (status) => void changeStatus(temple, status) : undefined} />
                }
                stats={[
                  { label: "City", value: temple.temp_city || "-" },
                  { label: "Phone", value: temple.temp_phone || "-" },
                ]}
                fields={[
                  { label: "Registration", value: temple.temp_registration_number || "-" },
                  { label: "State", value: temple.temp_state || "-" },
                  { label: "Primary", value: temple.temp_is_primary ? "Yes" : "No" },
                ]}
                actions={
                  (canView || canEdit || canDelete) && (
                    <>
                      {canView && <RowAction type="view" title="View temple" to={`/temples/view/${temple.id}`} />}
                      {canEdit && <RowAction type="edit" title="Edit temple" to={`/temples/edit/${temple.id}`} />}
                      {canDelete && <RowAction type="delete" title="Delete temple" disabled={deleting} onClick={() => void handleDelete(temple.id, temple.temp_name)} />}
                    </>
                  )
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

      {/* ============================================================
          PAGINATION
          ============================================================ */}

      {total > 0 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {total}{" "}
            temples

          </div>

          <Pagination className="mx-0 w-auto">

            <PaginationContent>

              {/* Previous */}

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      safeCurrentPage >
                      1
                    ) {
                      handlePageChange(
                        safeCurrentPage -
                        1,
                      )
                    }
                  }}
                  className={
                    safeCurrentPage ===
                      1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

              {/* Pages */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => {
                  const page =
                    index + 1

                  return (
                    <PaginationItem
                      key={page}
                    >

                      <PaginationLink
                        href="#"
                        className="cursor-pointer"
                        isActive={
                          safeCurrentPage ===
                          page
                        }
                        onClick={(
                          event,
                        ) => {
                          event.preventDefault()

                          handlePageChange(
                            page,
                          )
                        }}
                      >
                        {page}
                      </PaginationLink>

                    </PaginationItem>
                  )
                },
              )}

              {/* Next */}

              <PaginationItem>

                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      safeCurrentPage <
                      totalPages
                    ) {
                      handlePageChange(
                        safeCurrentPage +
                        1,
                      )
                    }
                  }}
                  className={
                    safeCurrentPage ===
                      totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

            </PaginationContent>

          </Pagination>

        </div>
      )}

    </div>
  )
}
