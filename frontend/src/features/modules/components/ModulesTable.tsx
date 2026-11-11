
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
  selectModules,
  selectModulesLoading,
  selectModulesError,
  selectModulesPagination,
} from "../modulesSelectors"

import {
  fetchModules,
  editModule,
  removeModule,
} from "../moduleThunks"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"

const PAGE_SIZE = 10

export default function ModulesTable() {
  const dispatch = useDispatch<AppDispatch>()

  const modules = useSelector(selectModules)
  // console.log("modules", modules)
  const loading = useSelector(
    selectModulesLoading
  )
  const error = useSelector(
    selectModulesError
  )

  const pagination = useSelector(
    selectModulesPagination
  )

  const [currentPage, setCurrentPage] =
    useState(1)

  const [view, setView] = useState<
    "list" | "grid"
  >("list")

  const [search, setSearch] = useState("")

  const selection = useRowSelection(modules.map((item) => item.id))

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  /* ------------------------------------------------------------------------ */
  /* Fetch Modules                                                            */
  /* ------------------------------------------------------------------------ */

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof modules)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(editModule({ ...item, status: status as typeof item.status })).unwrap()
      await dispatch(fetchModules({ page: currentPage, limit: PAGE_SIZE, search }))
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(
      fetchModules({
        page: currentPage,
        limit: PAGE_SIZE,
        search,
      })
    )
  }, [dispatch, currentPage, search])

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const handlePageChange = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > pagination.totalPages
    ) {
      return
    }

    setCurrentPage(page)
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const refresh = (removed: number) => {
    if (removed >= modules.length && currentPage > 1) {
      setCurrentPage((page) => page - 1)
      return
    }
    void dispatch(fetchModules({ page: currentPage, limit: PAGE_SIZE, search }))
  }

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete module?"))) return
    const result = await dispatch(removeModule(id))
    if (removeModule.rejected.match(result)) return
    showCmtToast("success", "Module deleted successfully.")
    refresh(1)
  }

  const deleteSelected = async () => {
    const names = modules.filter((item) => selection.isSelected(item.id)).map((item) => item.module_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(removeModule(id)).unwrap(), "modules", names)
    if (!deleted.length) return
    selection.clear()
    refresh(deleted.length)
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    loading &&
    modules.length === 0 &&
    !search
  ) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading modules...
        </p>
      </div>
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    error &&
    modules.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          {error}
        </p>

        <Button
          className="mt-4"
          onClick={() => {
            void dispatch(
              fetchModules({
                page: currentPage,
                limit: PAGE_SIZE,
                search,
              })
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }


  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1

  const lastItem = Math.min(
    pagination.page *
      pagination.limit,
    pagination.total
  )

  return (
    <div className="w-full space-y-4">

      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <ListToolbar
        title="Modules"
        actions={
          <NavLink to="/modules/add">
            <Button className="cursor-pointer">
              Add Module
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search modules..."
        view={view}
        onViewChange={setView}
      />

      <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />

      {/* ================================================================== */}
      {/* LIST VIEW                                                          */}
      {/* ================================================================== */}

      {view === "list" && (
        <ResizableTable
          columns={[
            { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "module-name", label: "Module Name", size: 10 },
            { id: "code", label: "Code", size: 10 },
            { id: "module-type", label: "Module Type", size: 10 },
            { id: "capacity-type", label: "Capacity Type", size: 10 },
            { id: "consumable-type", label: "Consumable Type", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>

            {modules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center"
                >
                  No modules found.
                </TableCell>
              </TableRow>
            ) : (
              modules.map(
                (module, index) => (
                  <TableRow
                    key={module.id}
                    data-state={selection.isSelected(module.id) ? "selected" : undefined}
                  >

                    <TableCell>
                      <Checkbox checked={selection.isSelected(module.id)} onCheckedChange={() => selection.toggle(module.id)} aria-label="Select row" />
                    </TableCell>

                    <TableCell>
                      {(pagination.page - 1) *
                        pagination.limit +
                        index +
                        1}
                    </TableCell>

                    <TableCell className="font-medium capitalize">
                      {module.module_name}
                    </TableCell>

                    <TableCell className="capitalize">
                      {module.module_code}
                    </TableCell>

                    <TableCell>
                      <span className="capitalize">
                        {module.module_type}
                      </span>
                    </TableCell>

                    <TableCell className="capitalize">
                      {module.capacity_type ??
                        "-"}
                    </TableCell>

                    <TableCell className="capitalize">
                      {module.consumable_type ??
                        "-"}
                    </TableCell>

                    {/* <TableCell>
                      {module.display_order}
                    </TableCell> */}

                    <TableCell>

                      <StatusSelect value={module.status} disabled={statusUpdatingId === module.id} onChange={(status) => void changeStatus(module, status)} />

                    </TableCell>

                    {/* Actions */}

                    <TableCell>
                      <RowActions>
                        <RowAction type="view" to={`/modules/view/${module.id}`} />
                        <RowAction type="edit" to={`/modules/edit/${module.id}`} />
                        <RowAction type="delete" onClick={() => void handleDelete(module.id, module.module_name)} />
                      </RowActions>
                    </TableCell>

                  </TableRow>
                )
              )
            )}

          </TableBody>

        </ResizableTable>
      )}

      {/* ================================================================== */}
      {/* GRID VIEW                                                          */}
      {/* ================================================================== */}

      {view === "grid" && (
        <RecordCardGrid>
          {modules.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No modules found.</div>
          ) : (
            modules.map((module, index) => (
              <RecordCard
                key={module.id}
                index={(pagination.page - 1) * pagination.limit + index + 1}
                title={module.module_name}
                subtitle={module.module_code}
                badge={
                  <StatusSelect value={module.status} disabled={statusUpdatingId === module.id} onChange={(status) => void changeStatus(module, status)} />
                }
                stats={[
                  { label: "Module Type", value: module.module_type },
                  { label: "Capacity Type", value: module.capacity_type ?? "-" },
                ]}
                fields={[
                  { label: "Consumable Type", value: module.consumable_type ?? "-" },
                  { label: "Display Order", value: module.display_order },
                ]}
                actions={
                  <>
                    <RowAction type="view" title="View module" to={`/modules/view/${module.id}`} />
                    <RowAction type="edit" title="Edit module" to={`/modules/edit/${module.id}`} />
                    <RowAction type="delete" title="Delete module" onClick={() => void handleDelete(module.id, module.module_name)} />
                  </>
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

      {/* ================================================================== */}
      {/* PAGINATION                                                         */}
      {/* ================================================================== */}

      {pagination.total > 0 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {pagination.total}{" "}
            modules

          </div>

          <Pagination className="mx-0 w-auto">

            <PaginationContent>

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      pagination.page > 1
                    ) {
                      handlePageChange(
                        pagination.page - 1
                      )
                    }
                  }}
                  className={
                    pagination.page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

              {Array.from(
                {
                  length:
                    pagination.totalPages,
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
                        isActive={
                          pagination.page ===
                          page
                        }
                        onClick={(event) => {
                          event.preventDefault()

                          handlePageChange(
                            page
                          )
                        }}
                      >
                        {page}
                      </PaginationLink>

                    </PaginationItem>
                  )
                }
              )}

              <PaginationItem>

                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      pagination.page <
                      pagination.totalPages
                    ) {
                      handlePageChange(
                        pagination.page + 1
                      )
                    }
                  }}
                  className={
                    pagination.page ===
                    pagination.totalPages
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