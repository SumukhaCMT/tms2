import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import {
  List,
  LayoutGrid,
  //  Pencil,
  Eye,
  Trash2,
} from "lucide-react"

import {
  useDispatch,
  useSelector,
} from "react-redux"
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
import type { AppDispatch } from "@/app/store"

import {
  selectOrganizations,
  selectOrganizationsLoading,
} from "../organizationSelectors"

import {
  fetchOrganizations,
  deleteOrganization
} from "../organizationThunks"

import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


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

  useEffect(() => {
    dispatch(fetchOrganizations({}))
  }, [dispatch])


  // -----------------------------
  // PAGE CHANGE
  // -----------------------------

  const handlePageChange = (
    page: number,
  ) => {
    setCurrentPage(page)
  }
const handleDelete = async (id: number) => {
  console.log("DELETE ORGANIZATION ID:", id)
  console.log(
    "DELETE URL:",
    `/v1/organizations/${id}`,
  )

  const result = await dispatch(
    deleteOrganization(id),
  )

  console.log("DELETE RESULT:", result)

  if (deleteOrganization.rejected.match(result)) {
    console.error(
      "DELETE FAILED:",
      result.payload,
    )
    return
  }

  console.log(
    "DELETE SUCCESS:",
    result.payload,
  )

  // Refresh organizations after successful delete
  await dispatch(fetchOrganizations({}))

  // Fix page if last item was deleted
  if (
    currentOrganizations.length === 1 &&
    currentPage > 1
  ) {
    setCurrentPage((page) => page - 1)
  }
}

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
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

      <div className="flex items-center justify-between">

        <div>

           <NavLink to="/Organizations/add">
            <Button className="cursor-pointer">
              Add Organization
            </Button>
          </NavLink>

        </div>


        {/* LIST / GRID */}

        <div className="flex items-center gap-1 rounded-md border p-1">

          <Button
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


      {/* =========================
          LIST VIEW
      ========================== */}

      {view === "list" && (

        <div className="overflow-hidden rounded-md border">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  Organization Name
                </TableHead>

                <TableHead>
                 Organization legal Name
                </TableHead>

               
                <TableHead>
                 GST Number
                </TableHead>
                   <TableHead>
                 Oregistration Number
                </TableHead>
                 
                <TableHead>
                Organization  Email
                </TableHead>

                <TableHead>
                  Organization Phone
                </TableHead>

               
              <TableHead>
                 Full Address
                </TableHead>
                 <TableHead>
                 Created date ("customer since")
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

              {currentOrganizations.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={9}
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
                    >

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

                      <TableCell>
                        {organization.org_legal_name}
                      </TableCell>
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

                     <TableCell>
                        {organization.org_address_line1}
                      </TableCell>

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

                        <span
                          className={
                            organization.org_status ===
                            "active"
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                          }
                        >
                          {/* {organization.org_status} */}
                             {organization.org_status
                              ? organization.org_status.charAt(0).toUpperCase() +
                                organization.org_status.slice(1)
                              : "-"}
                        </span>

                      </TableCell>
<TableCell>
                        <div className="flex justify-end gap-1">

                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                          
                          >
                            <NavLink
                              to={`/organizations/view/${organization.id}`}
                            >
                              <Eye className="size-4" />
                            </NavLink>
                          </Button>

                          {/* <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                           
                          >
                            <NavLink
                              to={`/organizations/edit/${organization.id}`}
                            >
                              <Pencil className="size-4" />
                            </NavLink>
                          </Button> */}

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
        Delete organization?
      </AlertDialogTitle>

      <AlertDialogDescription>
        Are you sure you want to delete{" "}
        <span className="font-semibold text-foreground">
          {organization.org_name}
        </span>
        ? This action cannot be undone.
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
        onClick={() => handleDelete(organization.id)}
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


      {/* =========================
          GRID VIEW
      ========================== */}

      {view === "grid" && (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {currentOrganizations.length === 0 ? (

            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No organizations found
            </div>

          ) : (

            currentOrganizations.map(
              (
                organization,
                index,
              ) => (

                <div
                  key={organization.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs text-muted-foreground">
                        #
                        {startIndex +
                          index +
                          1}
                      </p>

                      <h3 className="mt-1 truncate font-semibold">
                        {organization.org_name}
                      </h3>

                     

                    </div>


                    {/* STATUS */}

                    <span
                      className={
                        organization.org_status ===
                        "active"
                          ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {organization.org_status}
                    </span>

                  </div>


                  {/* STATS */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    {/* TEMPLES */}

                   


                    {/* USERS */}

                   

                  </div>


                  {/* DETAILS */}

                  <div className="mt-4 space-y-2 text-sm">

                    {/* CITY */}

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        City
                      </span>

                      <span className="font-medium">
                        {organization.org_city}
                      </span>

                    </div>


                    {/* EMAIL */}

                    <div className="flex flex-col gap-1">

                      <span className="text-muted-foreground">
                        Email
                      </span>

                      <span className="truncate font-medium">
                        {organization.org_email}
                      </span>

                    </div>


                    {/* PHONE */}

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        Phone
                      </span>

                      <span className="font-medium">
                        {organization.org_phone}
                      </span>

                    </div>

                  </div>

                </div>

              ),
            )

          )}

        </div>

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