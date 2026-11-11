




"use client"

import {
  useEffect,
  useMemo,
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

import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../roleSelectors"

import {
  fetchRoles,
  deleteRole,
} from "../roleThunks"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { showCmtToast } from "@/components/ui/cmt-toast"


/* =========================================================
   FRONTEND PAGE SIZE
========================================================= */

const PAGE_SIZE = 10


/* =========================================================
   COMPONENT
========================================================= */

export default function RolesTable() {

  const dispatch =
    useDispatch<AppDispatch>()


  /* =========================================================
     REDUX
  ========================================================= */

  const roles =
    useSelector(
      selectRoles,
    )

  const loading =
    useSelector(
      selectRolesLoading,
    )

  const error =
    useSelector(
      selectRolesError,
    )


  /* =========================================================
     LOCAL STATE
  ========================================================= */

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

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }


  /* =========================================================
     FETCH ALL ROLES

     Backend does NOT use pagination.
     All roles are fetched once.
  ========================================================= */

  useEffect(() => {

    void dispatch(
      fetchRoles(search),
    )

  }, [
    dispatch,
    search,
  ])


  /* =========================================================
     FRONTEND PAGINATION
  ========================================================= */

  const totalRoles =
    roles.length

  const totalPages =
    Math.ceil(
      totalRoles /
        PAGE_SIZE,
    )


  /*
    Do not call setState() inside an effect.

    If the current page becomes invalid after
    deleting the last item, use a derived page.
  */

  const effectivePage =
    totalPages === 0
      ? 1
      : Math.min(
          currentPage,
          totalPages,
        )


  /* =========================================================
     CURRENT PAGE ROLES
  ========================================================= */

  const currentRoles =
    useMemo(() => {

      const startIndex =
        (effectivePage - 1) *
        PAGE_SIZE

      const endIndex =
        startIndex +
        PAGE_SIZE

      return roles.slice(
        startIndex,
        endIndex,
      )

    }, [
      roles,
      effectivePage,
    ])


  const selection = useRowSelection(currentRoles.map((item) => item.id))

  /* =========================================================
     PAGE CHANGE
  ========================================================= */

  const handlePageChange = (
    page: number,
  ) => {

    if (
      page < 1 ||
      page > totalPages
    ) {
      return
    }

    setCurrentPage(
      page,
    )
  }


  /* =========================================================
     DELETE ROLE
  ========================================================= */

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete role?"))) return
    const result = await dispatch(deleteRole(id))
    if (deleteRole.rejected.match(result)) return
    showCmtToast("success", "Role deleted successfully.")
    await dispatch(fetchRoles(search))
  }

  const deleteSelected = async () => {
    const names = roles.filter((item) => selection.isSelected(item.id)).map((item) => item.user_role_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteRole(id)).unwrap(), "roles", names)
    if (!deleted.length) return
    selection.clear()
    await dispatch(fetchRoles(search))
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    roles.length === 0 &&
    !search
  ) {

    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Loading roles...
        </p>

      </div>
    )
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    roles.length === 0
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
              fetchRoles(search),
            )
          }}
        >
          Try Again
        </Button>

      </div>
    )
  }


  /* =========================================================
     DISPLAY RANGE
  ========================================================= */

  const firstItem =
    totalRoles === 0
      ? 0
      : (effectivePage - 1) *
          PAGE_SIZE +
        1


  const lastItem =
    Math.min(
      effectivePage *
        PAGE_SIZE,
      totalRoles,
    )


  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="w-full space-y-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <ListToolbar
        title="Roles"
        actions={
          <NavLink to="/roles/add">
            <Button className="cursor-pointer">
              Add Role
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search roles..."
        view={view}
        onViewChange={setView}
      />


      <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />

      {/* =====================================================
          LIST VIEW
      ===================================================== */}

      {view === "list" && (

        <ResizableTable
          columns={[
            { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "user-role-name", label: "User Role Name", size: 10 },
            { id: "user-role", label: "User Role", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >


          <TableBody>

            {currentRoles.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={5}
                  className="h-24 text-center"
                >
                  No roles found.
                </TableCell>

              </TableRow>

            ) : (

              currentRoles.map(
                (
                  role,
                  index,
                ) => (

                  <TableRow
                    key={role.id}
                    data-state={selection.isSelected(role.id) ? "selected" : undefined}
                  >

                    <TableCell>
                      <Checkbox checked={selection.isSelected(role.id)} onCheckedChange={() => selection.toggle(role.id)} aria-label="Select row" />
                    </TableCell>

                    {/* SL NO */}

                    <TableCell>

                      {(effectivePage - 1) *
                        PAGE_SIZE +
                        index +
                        1}

                    </TableCell>


                    {/* ROLE NAME */}

                    <TableCell className="font-medium capitalize">

                      {role.user_role_name}

                    </TableCell>


                    {/* ROLE CODE */}

                    <TableCell>

                      {role.user_role ||
                        "-"}

                    </TableCell>


                    {/* ACTIONS */}

                    <TableCell>

                      <RowActions>
                        <RowAction type="view" to={`/roles/view/${role.id}`} />
                        <RowAction type="edit" to={`/roles/edit/${role.id}`} />
                        <RowAction type="delete" onClick={() => void handleDelete(role.id, role.user_role_name)} />
                      </RowActions>

                    </TableCell>

                  </TableRow>

                ),
              )

            )}

          </TableBody>

        </ResizableTable>

      )}


      {/* =====================================================
          GRID VIEW
      ===================================================== */}

      {view === "grid" && (
        <RecordCardGrid>
          {currentRoles.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No roles found.</div>
          ) : (
            currentRoles.map((role, index) => (
              <RecordCard
                key={role.id}
                index={(effectivePage - 1) * PAGE_SIZE + index + 1}
                title={<span className="capitalize">{role.user_role_name}</span>}
                subtitle={role.user_role || "-"}
                fields={[
                  { label: "User Role Name", value: <span className="capitalize">{role.user_role_name}</span> },
                  { label: "User Role", value: role.user_role || "-" },
                ]}
                actions={
                  <>
                    <RowAction type="view" title="View role" to={`/roles/view/${role.id}`} />
                    <RowAction type="edit" title="Edit role" to={`/roles/edit/${role.id}`} />
                    <RowAction type="delete" title="Delete role" onClick={() => void handleDelete(role.id, role.user_role_name)} />
                  </>
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}


      {/* =====================================================
          FRONTEND PAGINATION
      ===================================================== */}

      {totalRoles > 0 && (

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          {/* SHOWING */}

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {totalRoles}{" "}
            roles

          </div>


          {/* PAGINATION */}

          {totalPages > 1 && (

            <Pagination className="mx-0 w-auto">

              <PaginationContent>

                {/* PREVIOUS */}

                <PaginationItem>

                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {

                      event.preventDefault()

                      handlePageChange(
                        effectivePage - 1,
                      )

                    }}
                    className={
                      effectivePage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />

                </PaginationItem>


                {/* PAGE NUMBERS */}

                {Array.from(
                  {
                    length:
                      totalPages,
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
                            effectivePage ===
                            page
                          }
                          onClick={(event) => {

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


                {/* NEXT */}

                <PaginationItem>

                  <PaginationNext
                    href="#"
                    onClick={(event) => {

                      event.preventDefault()

                      handlePageChange(
                        effectivePage + 1,
                      )

                    }}
                    className={
                      effectivePage ===
                      totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />

                </PaginationItem>

              </PaginationContent>

            </Pagination>

          )}

        </div>

      )}

    </div>
  )
}