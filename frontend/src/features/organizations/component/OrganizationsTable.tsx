import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"
import type { AppDispatch } from "@/app/store"

import {
  selectOrganizations,
  selectOrganizationsLoading,
} from "../organizationSelectors"

import {
  fetchOrganizations,
  updateOrganization,
  deleteOrganization
} from "../organizationThunks"

import { Button } from "@/components/ui/button"
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
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"


export default function OrganizationsTable() {

  const dispatch = useDispatch<AppDispatch>()

  const organizations = useSelector(
    selectOrganizations,
  )

  const loading = useSelector(
    selectOrganizationsLoading,
  )


  // -----------------------------
  // VIEW
  // -----------------------------

  const [view, setView] =
    useState<"list" | "grid">("list")


  // -----------------------------
  // NORMAL FRONTEND PAGINATION
  // -----------------------------

  const PAGE_SIZE = 10

  const [currentPage, setCurrentPage] =
    useState(1)

  const [search, setSearch] = useState("")


  const totalPages = Math.ceil(
    organizations.length / PAGE_SIZE,
  )


  const startIndex =
    (currentPage - 1) * PAGE_SIZE


  const endIndex =
    startIndex + PAGE_SIZE


  const currentOrganizations =
    organizations.slice(
      startIndex,
      endIndex,
    )


  // -----------------------------
  // FETCH ALL ORGANIZATIONS
  // -----------------------------

  const selection = useRowSelection(currentOrganizations.map((item) => item.id))

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof organizations)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateOrganization({ id: item.id, org_status: status })).unwrap()
      await dispatch(fetchOrganizations(search ? { search } : {}))
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    dispatch(fetchOrganizations(search ? { search } : {}))
  }, [dispatch, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }


  // -----------------------------
  // PAGE CHANGE
  // -----------------------------

  const handlePageChange = (
    page: number,
  ) => {
    setCurrentPage(page)
  }
  const refresh = async (removed: number) => {
    await dispatch(fetchOrganizations(search ? { search } : {}))
    if (removed >= currentOrganizations.length && currentPage > 1) setCurrentPage((page) => page - 1)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete organization?"))) return
    const result = await dispatch(deleteOrganization(id))
    if (deleteOrganization.rejected.match(result)) return
    showCmtToast("success", "Organization deleted successfully.")
    await refresh(1)
  }

  const deleteSelected = async () => {
    const names = organizations.filter((item) => selection.isSelected(item.id)).map((item) => item.org_name)
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteOrganization(id)).unwrap(), "organizations", names)
    if (!deleted.length) return
    selection.clear()
    await refresh(deleted.length)
  }

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading && !search) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading organizations...
      </div>
    )
  }


  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="w-full space-y-4">


      {/* =========================
          HEADER
      ========================== */}

      <ListToolbar
        title="Organizations"
        actions={
          <NavLink to="/Organizations/add">
            <Button className="cursor-pointer">
              Add Organization
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search organizations..."
        view={view}
        onViewChange={setView}
      />


      <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />

      {/* =========================
          LIST VIEW
      ========================== */}

      {view === "list" && (

        <ResizableTable
          columns={[
            { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "organization-name", label: "Organization Name", size: 10 },
            { id: "gst-number", label: "GST Number", size: 10 },
            { id: "oregistration-number", label: "Oregistration Number", size: 10 },
            { id: "organization-email", label: "Organization Email", size: 10 },
            { id: "organization-phone", label: "Organization Phone", size: 10 },
            { id: "created-date", label: "Created date", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >


          <TableBody>

            {currentOrganizations.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={10}
                  className="py-10 text-center"
                >
                  No organizations found
                </TableCell>

              </TableRow>

            ) : (

              currentOrganizations.map(
                (
                  organization,
                  index,
                ) => (

                  <TableRow
                    key={organization.id}
                    data-state={selection.isSelected(organization.id) ? "selected" : undefined}
                  >

                    <TableCell>
                      <Checkbox checked={selection.isSelected(organization.id)} onCheckedChange={() => selection.toggle(organization.id)} aria-label="Select row" />
                    </TableCell>

                    {/* SL NO */}

                    <TableCell>
                      {startIndex +
                        index +
                        1}
                    </TableCell>


                    {/* ORGANIZATION */}

                    <TableCell className="font-medium">
                      {/* {organization.org_name} */}
                        {organization.org_name.charAt(0).toUpperCase() + organization.org_name.slice(1)}
                    </TableCell>


                    {/* CODE */}

                    {/* <TableCell>
                      {organization.org_legal_name}
                    </TableCell> */}
                    <TableCell>
                      {organization.org_gst_number}
                    </TableCell>

                    <TableCell>
                      {organization.org_registration_number}
                    </TableCell>

                  


                    {/* EMAIL */}

                    <TableCell>
                      {organization.org_email}
                    </TableCell>


                    {/* PHONE */}

                    <TableCell>
                      {organization.org_phone}
                    </TableCell>


                    {/* CITY */}

                   {/* <TableCell>
                      {organization.org_address_line1}
                    </TableCell> */}

                   {/* <TableCell>
  {new Date(
    organization.created_at,
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</TableCell> */}
<TableCell>
  {organization.created_at
    ? new Date(
        organization.created_at,
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-"}
</TableCell>
                    {/* STATUS */}

                    <TableCell>

                      <StatusSelect value={organization.org_status} disabled={statusUpdatingId === organization.id} onChange={(status) => void changeStatus(organization, status)} />

                    </TableCell>
<TableCell>
                      <RowActions>
                        <RowAction type="view" to={`/organizations/view/${organization.id}`} />
                        <RowAction type="delete" onClick={() => void handleDelete(organization.id, organization.org_name)} />
                      </RowActions>
                    </TableCell>
                  </TableRow>

                ),
              )

            )}

          </TableBody>

        </ResizableTable>

      )}


      {/* =========================
          GRID VIEW
      ========================== */}

      {view === "grid" && (
        <RecordCardGrid>
          {currentOrganizations.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">No organizations found</div>
          ) : (
            currentOrganizations.map((organization, index) => (
              <RecordCard
                key={organization.id}
                index={startIndex + index + 1}
                title={organization.org_name}
                badge={
                  <StatusSelect value={organization.org_status} disabled={statusUpdatingId === organization.id} onChange={(status) => void changeStatus(organization, status)} />
                }
                fields={[
                  { label: "City", value: organization.org_city },
                  { label: "Email", value: organization.org_email },
                  { label: "Phone", value: organization.org_phone },
                ]}
              />
            ))
          )}
        </RecordCardGrid>
      )}


      {/* =========================
          PAGINATION
      ========================== */}

      {totalPages > 0 && (

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">


          {/* SHOWING */}

          <div className="text-sm text-muted-foreground">

            Showing{" "}

            {startIndex + 1}

            {" "}to{" "}

            {Math.min(
              endIndex,
              organizations.length,
            )}

            {" "}of{" "}

            {organizations.length}

            {" "}organizations

          </div>


          {/* PAGINATION */}

          <Pagination className="mx-0 w-auto">

            <PaginationContent>


              {/* PREVIOUS */}

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {

                    event.preventDefault()

                    if (
                      currentPage > 1
                    ) {

                      setCurrentPage(
                        (page) =>
                          page - 1,
                      )

                    }

                  }}
                  className={
                    currentPage === 1
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
                          currentPage ===
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

                    if (
                      currentPage <
                      totalPages
                    ) {

                      setCurrentPage(
                        (page) =>
                          page + 1,
                      )

                    }

                  }}
                  className={
                    currentPage ===
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