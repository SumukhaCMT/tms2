


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

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { RowAction, RowActions } from "@/components/row-actions"
import { confirmDelete } from "@/components/confirm-delete"
import { useRowSelection } from "@/hooks/useRowSelection"
import { bulkDelete } from "@/utils/bulkDelete"
import { ListToolbar } from "@/components/ui/list-toolbar"

import {
  selectSubscriptionBundles,
  selectSubscriptionBundleLoading,
  selectSubscriptionBundleError,
} from "../subscriptionBundleSelectors"

import {
  fetchSubscriptionBundles,
  updateSubscriptionBundle,
  removeSubscriptionBundle,
} from "../subscriptionBundleThunks"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"

const PAGE_SIZE = 10

export default function SubscriptionBundlesTable() {
  const dispatch = useDispatch<AppDispatch>()

  const bundles =
    useSelector(selectSubscriptionBundles) ?? []

  const loading = useSelector(
    selectSubscriptionBundleLoading,
  )

  const error = useSelector(
    selectSubscriptionBundleError,
  )

  const [currentPage, setCurrentPage] =
    useState(1)

  const [view, setView] = useState<
    "list" | "grid"
  >("list")

  const [search, setSearch] = useState("")

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  /*
   * ================================================================
   * DATA
   * ================================================================
   */

  const total = bundles.length

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  )

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  )

  const paginatedBundles =
    bundles.slice(
      (safeCurrentPage - 1) *
        PAGE_SIZE,
      safeCurrentPage * PAGE_SIZE,
    )

  /*
   * ================================================================
   * FETCH SUBSCRIPTION BUNDLES
   * ================================================================
   */

  const selection = useRowSelection(paginatedBundles.map((item) => item.id))

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof bundles)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateSubscriptionBundle({ id: Number(item.id), data: { ...item, bundle_status: status as typeof item.bundle_status } })).unwrap()
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(
      fetchSubscriptionBundles(search),
    )
  }, [dispatch, search])

  /*
   * ================================================================
   * PAGINATION
   * ================================================================
   */

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

  /*
   * ================================================================
   * DELETE
   * ================================================================
   */

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete subscription bundle?"))) return
    const result = await dispatch(removeSubscriptionBundle(id))
    if (removeSubscriptionBundle.rejected.match(result)) return
    showCmtToast("success", "Subscription bundle deleted successfully.")
    void dispatch(fetchSubscriptionBundles(search))
  }

  const deleteSelected = async () => {
    const names = bundles.filter((item) => selection.isSelected(item.id)).map((item) => item.bundle_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(removeSubscriptionBundle(id)).unwrap(), "subscription bundles", names)
    if (!deleted.length) return
    selection.clear()
    void dispatch(fetchSubscriptionBundles(search))
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (
    loading &&
    bundles.length === 0 &&
    !search
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading subscription bundles...
        </p>
      </div>
    )
  }

  /*
   * ================================================================
   * ERROR
   * ================================================================
   */

  if (
    error &&
    bundles.length === 0
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
              fetchSubscriptionBundles(search),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /*
   * ================================================================
   * DISPLAY RANGE
   * ================================================================
   */

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

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <div className="w-full space-y-4">
      {/* ============================================================
          HEADER
          ============================================================ */}

      <ListToolbar
        title="Subscription Bundles"
        actions={
          <NavLink to="/subscription_bundles/add">
            <Button className="cursor-pointer">
              Add Subscription Bundle
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search bundles..."
        view={view}
        onViewChange={setView}
      />

      <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />

      {/* ============================================================
          LIST VIEW
          ============================================================ */}

      {view === "list" && (
        <ResizableTable
          columns={[
            { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "bundle-name", label: "Bundle Name", size: 10 },
            { id: "bundle-code", label: "Bundle Code", size: 10 },
            { id: "bundle-type", label: "Bundle Type", size: 10 },
            { id: "duration", label: "Duration", size: 10 },
            { id: "price", label: "Price", size: 10 },
            { id: "gst", label: "GST", size: 10 },
            { id: "total-price", label: "Total Price", size: 10 },
            { id: "amc-price", label: "AMC Price", size: 10 },
            { id: "amc-duration", label: "AMC Duration", size: 10 },
            { id: "plans", label: "Plans", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {paginatedBundles.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={14}
                  className="h-24 text-center"
                >
                  No subscription bundles
                  found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBundles.map(
                (bundle, index) => (
                  <TableRow
                    key={bundle.id}
                    data-state={selection.isSelected(bundle.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox checked={selection.isSelected(bundle.id)} onCheckedChange={() => selection.toggle(bundle.id)} aria-label="Select row" />
                    </TableCell>
                    {/* Sl No */}

                    <TableCell>
                      {(safeCurrentPage -
                        1) *
                        PAGE_SIZE +
                        index +
                        1}
                    </TableCell>

                    {/* Bundle Name */}

                    <TableCell className="font-medium">
                      {
                        bundle.bundle_name
                      }
                    </TableCell>

                    {/* Bundle Code */}

                    <TableCell>
                      {
                        bundle.bundle_code
                      }
                    </TableCell>

                    {/* Bundle Type */}

                    <TableCell className="capitalize">
                      {
                        bundle.bundle_type
                      }
                    </TableCell>

                    {/* Duration */}

                    <TableCell>
                      {bundle.bundle_duration_months ??
                        "-"}
                      {bundle.bundle_duration_months
                        ? " Months"
                        : ""}
                    </TableCell>

                    {/* Price */}

                    <TableCell>
                      ₹
                      {Number(
                        bundle.bundle_price,
                      ).toFixed(2)}
                    </TableCell>

                    {/* GST */}

                    <TableCell>
                      {Number(
                        bundle.bundle_gst_percentage,
                      ).toFixed(2)}
                      %
                    </TableCell>

                    {/* Total Price */}

                    <TableCell>
                      ₹
                      {Number(
                        bundle.bundle_total_price,
                      ).toFixed(2)}
                    </TableCell>

                    {/* AMC Price */}

                    <TableCell>
                      {bundle.bundle_amc_price ===
                      null
                        ? "-"
                        : `₹${Number(
                            bundle.bundle_amc_price,
                          ).toFixed(2)}`}
                    </TableCell>

                    {/* AMC Duration */}

                    <TableCell>
                      {bundle.bundle_amc_duration_months ??
                        "-"}
                      {bundle.bundle_amc_duration_months
                        ? " Months"
                        : ""}
                    </TableCell>

                    {/* Plans */}

                    <TableCell>
                      {bundle.plan_ids?.length ??
                        0}
                    </TableCell>

                    {/* Status */}

                    <TableCell>
                      <StatusSelect value={bundle.bundle_status} disabled={statusUpdatingId === bundle.id} onChange={(status) => void changeStatus(bundle, status)} />
                    </TableCell>

                    {/* Actions */}

                    <TableCell>
                      <RowActions>
                        <RowAction type="view" to={`/subscription_bundles/view/${bundle.id}`} />
                        <RowAction type="edit" to={`/subscription_bundles/edit/${bundle.id}`} />
                        <RowAction type="delete" onClick={() => void handleDelete(bundle.id, bundle.bundle_name)} />
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
          {paginatedBundles.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No subscription bundles found.</div>
          ) : (
            paginatedBundles.map((bundle, index) => (
              <RecordCard
                key={bundle.id}
                index={(safeCurrentPage - 1) * PAGE_SIZE + index + 1}
                title={bundle.bundle_name}
                subtitle={bundle.bundle_code}
                badge={
                  <StatusSelect value={bundle.bundle_status} disabled={statusUpdatingId === bundle.id} onChange={(status) => void changeStatus(bundle, status)} />
                }
                stats={[
                  { label: "Bundle Type", value: bundle.bundle_type },
                  { label: "Price", value: `₹${Number(bundle.bundle_price).toFixed(2)}` },
                ]}
                fields={[
                  { label: "Duration", value: bundle.bundle_duration_months ? `${bundle.bundle_duration_months} Months` : "-" },
                  { label: "GST", value: `${Number(bundle.bundle_gst_percentage).toFixed(2)}%` },
                  { label: "Total Price", value: `₹${Number(bundle.bundle_total_price).toFixed(2)}` },
                  { label: "AMC Price", value: bundle.bundle_amc_price === null ? "-" : `₹${Number(bundle.bundle_amc_price).toFixed(2)}` },
                  { label: "AMC Duration", value: bundle.bundle_amc_duration_months ? `${bundle.bundle_amc_duration_months} Months` : "-" },
                  { label: "Plans", value: bundle.plan_ids?.length ?? 0 },
                ]}
                actions={
                  <>
                    <RowAction type="view" title="View bundle" to={`/subscription_bundles/view/${bundle.id}`} />
                    <RowAction type="edit" title="Edit bundle" to={`/subscription_bundles/edit/${bundle.id}`} />
                    <RowAction type="delete" title="Delete bundle" onClick={() => void handleDelete(bundle.id, bundle.bundle_name)} />
                  </>
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
            subscription bundles
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
                      safeCurrentPage > 1
                    ) {
                      handlePageChange(
                        safeCurrentPage - 1,
                      )
                    }
                  }}
                  className={
                    safeCurrentPage === 1
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
                        safeCurrentPage + 1,
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