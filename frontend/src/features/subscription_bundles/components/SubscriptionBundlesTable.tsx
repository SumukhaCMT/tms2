// export default function SbscriptionBundlesTable(){

//   return(
//     <>
// table

//     </>
//   )
// }


import { useEffect, useState } from "react"

import {
  List,
  LayoutGrid,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { NavLink } from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import type { AppDispatch } from "@/app/store"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Button } from "@/components/ui/button"

import {
  selectSubscriptionBundles,
  selectSubscriptionBundleLoading,
  selectSubscriptionBundleError,
} from "../subscriptionBundleSelectors"

import {
  fetchSubscriptionBundles,
  removeSubscriptionBundle,
} from "../subscriptionBundleThunks"

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

  useEffect(() => {
    void dispatch(
      fetchSubscriptionBundles(),
    )
  }, [dispatch])

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

  const handleDelete = async (
    id: number,
  ) => {
    const result = await dispatch(
      removeSubscriptionBundle(id),
    )

    if (
      removeSubscriptionBundle.rejected.match(
        result,
      )
    ) {
      console.error(result.payload)
      return
    }

    void dispatch(
      fetchSubscriptionBundles(),
    )
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (
    loading &&
    bundles.length === 0
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
              fetchSubscriptionBundles(),
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

      <div className="flex items-center justify-between">
        <div>
          <NavLink to="/subscriptionbundles/add">
            <Button className="cursor-pointer">
              Add Subscription Bundle
            </Button>
          </NavLink>
        </div>

        {/* List / Grid Toggle */}

        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            className="cursor-pointer"
            type="button"
            variant={
              view === "list"
                ? "default"
                : "ghost"
            }
            size="icon"
            onClick={() =>
              setView("list")
            }
            title="List View"
          >
            <List className="size-4" />
          </Button>

          <Button
            className="cursor-pointer"
            type="button"
            variant={
              view === "grid"
                ? "default"
                : "ghost"
            }
            size="icon"
            onClick={() =>
              setView("grid")
            }
            title="Grid View"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {/* ============================================================
          LIST VIEW
          ============================================================ */}

      {view === "list" && (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  Bundle Name
                </TableHead>

                <TableHead>
                  Bundle Code
                </TableHead>

                <TableHead>
                  Bundle Type
                </TableHead>

                <TableHead>
                  Duration
                </TableHead>

                <TableHead>
                  Price
                </TableHead>

                <TableHead>
                  GST
                </TableHead>

                <TableHead>
                  Total Price
                </TableHead>

                <TableHead>
                  AMC Price
                </TableHead>

                <TableHead>
                  AMC Duration
                </TableHead>

                <TableHead>
                  Plans
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedBundles.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
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
                    >
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
                        <span
                          className={
                            bundle.bundle_status ===
                            "active"
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 capitalize"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 capitalize"
                          }
                        >
                          {
                            bundle.bundle_status
                          }
                        </span>
                      </TableCell>

                      {/* Actions */}

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {/* View */}

                          <NavLink
                            to={`/subscriptionbundles/view/${bundle.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                              className="cursor-pointer"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </NavLink>

                          {/* Edit */}

                          <NavLink
                            to={`/subscriptionbundles/edit/${bundle.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              className="cursor-pointer"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </NavLink>

                          {/* Delete */}

                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  className="cursor-pointer"
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              }
                            />

                            <AlertDialogContent size="sm">
                              <AlertDialogHeader>
                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                                  <Trash2 className="size-5" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>
                                  Delete Subscription
                                  Bundle?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  Are you sure you
                                  want to delete{" "}
                                  <span className="font-semibold text-foreground">
                                    {
                                      bundle.bundle_name
                                    }
                                  </span>
                                  ? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  variant="outline"
                                  className="cursor-pointer"
                                >
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                  className="cursor-pointer"
                                  variant="destructive"
                                  onClick={() =>
                                    void handleDelete(
                                      bundle.id,
                                    )
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ============================================================
          GRID VIEW
          ============================================================ */}

      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedBundles.length ===
          0 ? (
            <div className="col-span-full rounded-md border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No subscription bundles
                found.
              </p>
            </div>
          ) : (
            paginatedBundles.map(
              (bundle, index) => (
                <div
                  key={bundle.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Card Header */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        #
                        {(safeCurrentPage -
                          1) *
                          PAGE_SIZE +
                          index +
                          1}
                      </p>

                      <h3 className="mt-1 truncate font-semibold">
                        {
                          bundle.bundle_name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          bundle.bundle_code
                        }
                      </p>
                    </div>

                    <span
                      className={
                        bundle.bundle_status ===
                        "active"
                          ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {
                        bundle.bundle_status
                      }
                    </span>
                  </div>

                  {/* Main Stats */}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        Bundle Type
                      </p>

                      <p className="mt-1 text-lg font-semibold capitalize">
                        {
                          bundle.bundle_type
                        }
                      </p>
                    </div>

                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        Price
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        ₹
                        {Number(
                          bundle.bundle_price,
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        Duration
                      </span>

                      <span className="font-medium">
                        {bundle.bundle_duration_months ??
                          "-"}
                        {bundle.bundle_duration_months
                          ? " Months"
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        GST
                      </span>

                      <span className="font-medium">
                        {Number(
                          bundle.bundle_gst_percentage,
                        ).toFixed(2)}
                        %
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        Total Price
                      </span>

                      <span className="font-medium">
                        ₹
                        {Number(
                          bundle.bundle_total_price,
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        AMC Price
                      </span>

                      <span className="font-medium">
                        {bundle.bundle_amc_price ===
                        null
                          ? "-"
                          : `₹${Number(
                              bundle.bundle_amc_price,
                            ).toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        AMC Duration
                      </span>

                      <span className="font-medium">
                        {bundle.bundle_amc_duration_months ??
                          "-"}
                        {bundle.bundle_amc_duration_months
                          ? " Months"
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        Plans
                      </span>

                      <span className="font-medium">
                        {bundle.plan_ids?.length ??
                          0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                    {/* View */}

                    <NavLink
                      to={`/subscription-bundles/view/${bundle.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </Button>
                    </NavLink>

                    {/* Edit */}

                    <NavLink
                      to={`/subscription-bundles/edit/${bundle.id}`}
                    >
                      <Button
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                    </NavLink>

                    {/* Delete */}

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="cursor-pointer"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        }
                      />

                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                            <Trash2 className="size-5" />
                          </AlertDialogMedia>

                          <AlertDialogTitle>
                            Delete Subscription
                            Bundle?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Are you sure you
                            want to delete{" "}
                            <span className="font-semibold text-foreground">
                              {
                                bundle.bundle_name
                              }
                            </span>
                            ? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel
                            variant="outline"
                            className="cursor-pointer"
                          >
                            Cancel
                          </AlertDialogCancel>

                          <AlertDialogAction
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() =>
                              void handleDelete(
                                bundle.id,
                              )
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ),
            )
          )}
        </div>
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