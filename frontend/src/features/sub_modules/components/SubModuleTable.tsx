







"use client"

import {
  useEffect,
  useState,
} from "react"


import {
  NavLink,
} from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import type {
  AppDispatch,
} from "@/app/store"


import {
  Button,
} from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { RowAction, RowActions } from "@/components/row-actions"
import { confirmDelete } from "@/components/confirm-delete"
import { useRowSelection } from "@/hooks/useRowSelection"
import { bulkDelete } from "@/utils/bulkDelete"
import { ListToolbar } from "@/components/ui/list-toolbar"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  selectSubModules,
  selectSubModulesError,
  selectSubModulesLoading,
  selectSubModulesPagination,
} from "../submoduleSelectors"

import {
  fetchSubModules,
  editSubModule,
  removeSubModule,
} from "../submoduleThunks"

import type {
  SubModulePermission,
} from "../submoduleTypes"

/* ========================================================================== */
/* ROLES                                                                      */
/* ========================================================================== */

import {
  fetchRoles,
} from "../../roles/roleThunks"

import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../../roles/roleSelectors"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const PAGE_SIZE = 15

/* ========================================================================== */
/* PERMISSION HELPER                                                          */
/* ========================================================================== */

const getPermission = (
  permissions: SubModulePermission[] | undefined,
  roleId: number,
): number => {
  return (
    permissions?.find(
      (permission) =>
        Number(permission.role_id) ===
        Number(roleId),
    )?.permission ?? 0
  )
}

/* ========================================================================== */
/* PERMISSION LABEL                                                           */
/* ========================================================================== */

const getPermissionLabel = (
  permission: number,
): string => {
  const labels: Record<number, string> = {
    0: "Read",
    1: "Read + Delete",
    2: "Read + Edit",
    3: "Read + Edit + Delete",
    4: "Read + Add",
    5: "Read + Add + Delete",
    6: "Read + Add + Edit",
    7: "Full Access",
  }

  return (
    labels[permission] ??
    "No Access"
  )
}

/* ========================================================================== */
/* PERMISSION BADGE                                                           */
/* ========================================================================== */

function PermissionBadge({
  permission,
}: {
  permission: number
}) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
      {getPermissionLabel(permission)}
    </span>
  )
}

/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ModulesTable() {
  const dispatch =
    useDispatch<AppDispatch>()

  /* ======================================================================== */
  /* SUB MODULES                                                              */
  /* ======================================================================== */

  const modules =
    useSelector(selectSubModules)

  const loading =
    useSelector(selectSubModulesLoading)

  const error =
    useSelector(selectSubModulesError)

  const pagination =
    useSelector(
      selectSubModulesPagination,
    )

  /* ======================================================================== */
  /* ROLES                                                                    */
  /* ======================================================================== */

  const roles =
    useSelector(selectRoles)

  const rolesLoading =
    useSelector(selectRolesLoading)

  const rolesError =
    useSelector(selectRolesError)

  /* ======================================================================== */
  /* LOCAL STATE                                                              */
  /* ======================================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [
    view,
    setView,
  ] = useState<
    "list" | "grid"
  >("list")

  const [search, setSearch] = useState("")

  const selection = useRowSelection(modules.map((item) => item.id))

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  /* ======================================================================== */
  /* FETCH SUB MODULES                                                        */
  /* ======================================================================== */

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof modules)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(editSubModule({ ...item, sub_module_status: status as typeof item.sub_module_status })).unwrap()
      await dispatch(fetchSubModules({ page: currentPage, limit: PAGE_SIZE, search }))
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(
      fetchSubModules({
        page: currentPage,
        limit: PAGE_SIZE,
        search,
      }),
    )
  }, [
    dispatch,
    currentPage,
    search,
  ])

  /* ======================================================================== */
  /* FETCH ROLES                                                              */
  /* ======================================================================== */

  useEffect(() => {
    void dispatch(fetchRoles())
  }, [dispatch])

  /* ======================================================================== */
  /* PAGE CHANGE                                                              */
  /* ======================================================================== */

  const handlePageChange = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > pagination.totalPages
    ) {
      return
    }

    setCurrentPage(page)
  }

  /* ======================================================================== */
  /* DELETE                                                                   */
  /* ======================================================================== */

  const refresh = (removed: number) => {
    if (removed >= modules.length && currentPage > 1) {
      setCurrentPage((page) => page - 1)
      return
    }
    void dispatch(fetchSubModules({ page: currentPage, limit: PAGE_SIZE, search }))
  }

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete sub module?"))) return
    const result = await dispatch(removeSubModule(id))
    if (removeSubModule.rejected.match(result)) return
    showCmtToast("success", "Sub module deleted successfully.")
    refresh(1)
  }

  const deleteSelected = async () => {
    const names = modules.filter((item) => selection.isSelected(item.id)).map((item) => item.sub_module_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(removeSubModule(id)).unwrap(), "sub modules", names)
    if (!deleted.length) return
    selection.clear()
    refresh(deleted.length)
  }

  /* ======================================================================== */
  /* LOADING                                                                  */
  /* ======================================================================== */

  if (
    (loading ||
      rolesLoading) &&
    modules.length === 0 &&
    !search
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading sub modules...
        </p>
      </div>
    )
  }

  /* ======================================================================== */
  /* ROLE ERROR                                                               */
  /* ======================================================================== */

  if (
    rolesError &&
    roles.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load roles.
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {rolesError}
        </p>

        <Button
          className="mt-4"
          onClick={() => {
            void dispatch(
              fetchRoles(),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ======================================================================== */
  /* SUB MODULE ERROR                                                         */
  /* ======================================================================== */

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
              fetchSubModules({
                page: currentPage,
                limit: PAGE_SIZE,
                search,
              }),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ======================================================================== */
  /* PAGINATION INFO                                                          */
  /* ======================================================================== */

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1

  const lastItem =
    Math.min(
      pagination.page *
        pagination.limit,
      pagination.total,
    )

  /* ======================================================================== */
  /* TOTAL TABLE COLUMNS                                                      */
  /* ======================================================================== */

  /*
   * Fixed columns:
   *
   * 1. Sl.no
   * 2. Sub Module Name
   * 3. Code
   * 4. Module ID
   * 5. Status
   * 6. Actions
   *
   * Dynamic columns:
   *
   * roles.length
   */

  const totalColumns =
    7 + roles.length

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <div className="w-full space-y-4">

      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <ListToolbar
        title="Sub Modules"
        actions={
          <NavLink to="/submodules/add">
            <Button className="cursor-pointer">
              Add Sub Module
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search sub modules..."
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
            { id: "sub-module-name", label: "Sub Module Name", size: 10 },
            { id: "sub-module-code", label: "Sub Module Code", size: 10 },
            { id: "module-id", label: "Module ID", size: 10 },
            ...roles.map((role) => ({ id: `col-${role.id}`, label: role.user_role_name, size: 8 })),
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          {/* ============================================================ */}
          {/* TABLE BODY                                                    */}
          {/* ============================================================ */}

          <TableBody>

            {/* ======================================================== */}
            {/* EMPTY                                                     */}
            {/* ======================================================== */}

            {modules.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={
                    totalColumns
                  }
                  className="h-24 text-center"
                >
                  No sub modules found.
                </TableCell>

              </TableRow>

            ) : (

              /* ======================================================== */
              /* MODULES                                                   */
              /* ======================================================== */

              modules.map(
                (
                  module,
                  index,
                ) => {

                  return (
                    <TableRow
                      key={
                        module.id
                      }
                      data-state={selection.isSelected(module.id) ? "selected" : undefined}
                    >

                      <TableCell>
                        <Checkbox checked={selection.isSelected(module.id)} onCheckedChange={() => selection.toggle(module.id)} aria-label="Select row" />
                      </TableCell>

                      {/* ================================================= */}
                      {/* SL NO                                             */}
                      {/* ================================================= */}

                      <TableCell>
                        {(pagination.page -
                          1) *
                          pagination.limit +
                          index +
                          1}
                      </TableCell>

                      {/* ================================================= */}
                      {/* NAME                                              */}
                      {/* ================================================= */}

                      <TableCell className="font-medium capitalize">
                        {module.sub_module_name}
                      </TableCell>

                      {/* ================================================= */}
                      {/* CODE                                              */}
                      {/* ================================================= */}

                      <TableCell className="capitalize" >
                        {module.sub_module_code}
                      </TableCell>

                      {/* ================================================= */}
                      {/* MODULE ID                                         */}
                      {/* ================================================= */}

                      <TableCell>
                        {module.module_id}
                      </TableCell>

                      {/* ================================================= */}
                      {/* DYNAMIC ROLE PERMISSIONS                         */}
                      {/* ================================================= */}

                      {roles.map(
                        (role) => {

                          const permission =
                            getPermission(
                              module.permissions,
                              Number(
                                role.id,
                              ),
                            )

                          return (
                            <TableCell
                              key={
                                role.id
                              }
                            >
                              <PermissionBadge
                                permission={
                                  permission
                                }
                              />
                            </TableCell>
                          )
                        },
                      )}

                      {/* ================================================= */}
                      {/* STATUS                                            */}
                      {/* ================================================= */}

                      <TableCell>
                        <StatusSelect value={module.sub_module_status} disabled={statusUpdatingId === module.id} onChange={(status) => void changeStatus(module, status)} />
                      </TableCell>

                      {/* ================================================= */}
                      {/* ACTIONS                                           */}
                      {/* ================================================= */}

                      <TableCell>
                        <RowActions>
                          <RowAction type="edit" to={`/submodules/edit/${module.id}`} />
                          <RowAction type="delete" onClick={() => void handleDelete(module.id, module.sub_module_name)} />
                        </RowActions>
                      </TableCell>

                    </TableRow>
                  )
                },
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
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No sub modules found.</div>
          ) : (
            modules.map((module, index) => (
              <RecordCard
                key={module.id}
                index={(pagination.page - 1) * pagination.limit + index + 1}
                title={module.sub_module_name}
                subtitle={module.sub_module_code}
                badge={<StatusSelect value={module.sub_module_status} disabled={statusUpdatingId === module.id} onChange={(status) => void changeStatus(module, status)} />}
                fields={[
                  { label: "Module ID", value: module.module_id },
                  { label: "Display Order", value: module.display_order },
                  { label: "Note", value: module.note ?? "-" },
                ]}
                actions={
                  <>
                    <RowAction type="edit" title="Edit sub module" to={`/submodules/edit/${module.id}`} />
                    <RowAction type="delete" title="Delete sub module" onClick={() => void handleDelete(module.id, module.sub_module_name)} />
                  </>
                }
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium">Permissions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <div key={role.id} className="rounded-md bg-muted/60 px-2.5 py-2">
                        <p className="truncate text-xs text-muted-foreground">{role.user_role_name}</p>
                        <p className="mt-0.5 text-xs font-medium">{getPermissionLabel(getPermission(module.permissions, Number(role.id)))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </RecordCard>
            ))
          )}
        </RecordCardGrid>
      )}

      {/* ================================================================== */}
      {/* PAGINATION                                                         */}
      {/* ================================================================== */}

      {pagination.total > 0 && (

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          {/* SHOWING */}

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {pagination.total}{" "}
            sub modules

          </div>

          {/* PAGINATION */}

          <Pagination className="mx-0 w-auto">

            <PaginationContent>

              {/* ======================================================== */}
              {/* PREVIOUS                                                 */}
              {/* ======================================================== */}

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {

                    event.preventDefault()

                    if (
                      pagination.page >
                      1
                    ) {
                      handlePageChange(
                        pagination.page -
                          1,
                      )
                    }

                  }}
                  className={
                    pagination.page ===
                    1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

              {/* ======================================================== */}
              {/* PAGE NUMBERS                                              */}
              {/* ======================================================== */}

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

              {/* ======================================================== */}
              {/* NEXT                                                      */}
              {/* ======================================================== */}

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
                        pagination.page +
                          1,
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