import { useEffect, useState } from "react"
import {

  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  useDispatch,
  useSelector,
} from "react-redux"

import type { AppDispatch } from "@/app/store"

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

import {
  selectSubModules,
  selectSubModulesError,
  selectSubModulesLoading,
  selectSubModulesPagination,
} from "../submoduleSelectors"

import {
  fetchSubModules,
  removeSubModule,
} from "../submoduleThunks"

import type { SubModulePermission } from "../submoduleTypes"

const PAGE_SIZE = 10

/* -------------------------------------------------------------------------- */
/* PERMISSION HELPER                                                          */
/* -------------------------------------------------------------------------- */

const getPermission = (
  permissions: SubModulePermission[] | undefined,
  roleId: number
): number => {
  return (
    permissions?.find(
      (permission) =>
        permission.role_id === roleId
    )?.permission ?? 0
  )
}

/* -------------------------------------------------------------------------- */
/* PERMISSION LABEL                                                           */
/* -------------------------------------------------------------------------- */

const getPermissionLabel = (
  permission: number
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

  return labels[permission] ?? "No Access"
}

/* -------------------------------------------------------------------------- */
/* PERMISSION BADGE                                                           */
/* -------------------------------------------------------------------------- */

function PermissionBadge({
  permission,
}: {
  permission: number
}) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      {getPermissionLabel(permission)}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: "active" | "inactive"
}) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
      }
    >
      {/* {status} */}
        {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ModulesTable() {
  const dispatch = useDispatch<AppDispatch>()

  const modules = useSelector(selectSubModules)
console.log(modules)
  const loading = useSelector(
    selectSubModulesLoading
  )

  const error = useSelector(
    selectSubModulesError
  )

  const pagination = useSelector(
    selectSubModulesPagination
  )

  const [currentPage, setCurrentPage] =
    useState(1)

  const [view, setView] = useState<
    "list" | "grid"
  >("list")

  /* ------------------------------------------------------------------------ */
  /* FETCH                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    void dispatch(
      fetchSubModules({
        page: currentPage,
        limit: PAGE_SIZE,
      })
    )
  }, [dispatch, currentPage])

  /* ------------------------------------------------------------------------ */
  /* PAGE CHANGE                                                              */
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
  /* DELETE                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async (
    id: number
  ) => {
    const result = await dispatch(
      removeSubModule(id)
    )

    if (
      removeSubModule.rejected.match(result)
    ) {
      console.error(result.payload)
      return
    }

    /*
     * If the last item of the current page
     * was deleted, move to previous page.
     */
    if (
      modules.length === 1 &&
      currentPage > 1
    ) {
      setCurrentPage(
        (page) => page - 1
      )
      return
    }

    /*
     * Refresh current page after delete.
     */
    void dispatch(
      fetchSubModules({
        page: currentPage,
        limit: PAGE_SIZE,
      })
    )
  }

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    loading &&
    modules.length === 0
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading sub modules...
        </p>
      </div>
    )
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
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
              fetchSubModules({
                page: currentPage,
                limit: PAGE_SIZE,
              })
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ------------------------------------------------------------------------ */
  /* PAGINATION INFO                                                          */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full space-y-4">

      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="flex items-center justify-between gap-4">

        {/* ADD BUTTON */}

        <NavLink to="/submodule/add">
          <Button className="cursor-pointer">
            Add Sub Module
          </Button>
        </NavLink>

        {/* LIST / GRID */}

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

      {/* ================================================================== */}
      {/* LIST VIEW                                                          */}
      {/* ================================================================== */}

      {view === "list" && (
        <div className="overflow-x-auto rounded-md border">

          <Table className="min-w-[1200px]">

            <TableHeader>
              <TableRow>

                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  Sub Module Name
                </TableHead>

                <TableHead>
                  Code
                </TableHead>

                <TableHead>
                  Module ID
                </TableHead>

                <TableHead>
                  Org Admin
                </TableHead>

                <TableHead>
                  Temple Admin
                </TableHead>

                <TableHead>
                  User
                </TableHead>

                <TableHead>
                 SupperAdmin
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

              {modules.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={10}
                    className="h-24 text-center"
                  >
                    No sub modules found.
                  </TableCell>

                </TableRow>

              ) : (

                modules.map(
                  (module, index) => {

                    const orgAdminPermission =
                      getPermission(
                        module.permissions,
                        2
                      )

                    const templeAdminPermission =
                      getPermission(
                        module.permissions,
                        3
                      )

                    const userPermission =
                      getPermission(
                        module.permissions,
                        4
                      )

                    const staffPermission =
                      getPermission(
                        module.permissions,
                        1
                      )

                    return (
                      <TableRow
                        key={module.id}
                      >

                        {/* SL NO */}

                        <TableCell>
                          {(pagination.page - 1) *
                            pagination.limit +
                            index +
                            1}
                        </TableCell>

                        {/* NAME */}

                        <TableCell className="font-medium">
                          {/* {module.sub_module_name} */}
                          {module.sub_module_name.charAt(0).toUpperCase() + module.sub_module_name.slice(1).charAt(0).toUpperCase() + module.sub_module_name.slice(1)}
                        </TableCell>

                        {/* CODE */}

                        <TableCell>
                          {/* {module.sub_module_code} */}
                           {module.sub_module_code.charAt(0).toUpperCase() + module.sub_module_code.slice(1)}
                        </TableCell>

                        {/* MODULE ID */}

                        <TableCell>
                          {module.module_id}
                        </TableCell>

                        {/* ORG ADMIN */}

                        <TableCell>
                          <PermissionBadge
                            permission={
                              orgAdminPermission
                            }
                          />
                        </TableCell>

                        {/* TEMPLE ADMIN */}

                        <TableCell>
                          <PermissionBadge
                            permission={
                              templeAdminPermission
                            }
                          />
                        </TableCell>

                        {/* USER */}

                        <TableCell>
                          <PermissionBadge
                            permission={
                              userPermission
                            }
                          />
                        </TableCell>

                        {/* STAFF */}

                        <TableCell>
                          <PermissionBadge
                            permission={
                              staffPermission
                            }
                          />
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <StatusBadge
                            status={
                              module.sub_module_status
                            }
                          />
                        </TableCell>

                        {/* ACTIONS */}

                        <TableCell>
                          <div className="flex justify-end gap-1">

                            {/* VIEW */}

                            {/* <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                             
                            >
                              <NavLink
                                to={`/submodule/view/${module.id}`}
                              >
                                <Eye className="size-4" />
                              </NavLink>
                            </Button> */}

                            {/* EDIT */}

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                           
                            >
                              <NavLink
                                to={`/submodule/edit/${module.id}`}
                              >
                                <Pencil className="size-4" />
                              </NavLink>
                            </Button>

                            {/* DELETE */}

                            <AlertDialog>

                              <AlertDialogTrigger
                             
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="size-4 text-destructive cursor-pointer" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent
                                size="sm"
                              >

                                <AlertDialogHeader>

                                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 ">
                                    <Trash2 className="size-5" />
                                  </AlertDialogMedia>

                                  <AlertDialogTitle>
                                    Delete Sub Module?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    Are you sure you
                                    want to delete{" "}
                                    <span className="font-semibold text-foreground">
                                      {
                                        module.sub_module_name
                                      }
                                    </span>
                                    ? This action
                                    cannot be undone.
                                  </AlertDialogDescription>

                                </AlertDialogHeader>

                                <AlertDialogFooter>

                                  <AlertDialogCancel
                                   className="cursor-pointer"
                                    variant="outline"
                                  >
                                    Cancel
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                  className="cursor-pointer"
                                    variant="destructive"
                                    onClick={() =>
                                      void handleDelete(
                                        module.id
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
                    )
                  }
                )

              )}

            </TableBody>

          </Table>

        </div>
      )}

      {/* ================================================================== */}
      {/* GRID VIEW                                                          */}
      {/* ================================================================== */}

      {view === "grid" && (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {modules.length === 0 ? (

            <div className="col-span-full rounded-md border p-8 text-center">

              <p className="text-sm text-muted-foreground">
                No sub modules found.
              </p>

            </div>

          ) : (

            modules.map(
              (module, index) => {

                const orgAdminPermission =
                  getPermission(
                    module.permissions,
                    2
                  )

                const templeAdminPermission =
                  getPermission(
                    module.permissions,
                    3
                  )

                const userPermission =
                  getPermission(
                    module.permissions,
                    4
                  )

                const staffPermission =
                  getPermission(
                    module.permissions,
                    1
                  )

                return (
                  <div
                    key={module.id}
                    className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-xs text-muted-foreground">
                          #
                          {(pagination.page - 1) *
                            pagination.limit +
                            index +
                            1}
                        </p>

                        <h3 className="mt-1 truncate font-semibold">
                          {module.sub_module_name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {module.sub_module_code}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          module.sub_module_status
                        }
                      />

                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          Module ID
                        </span>

                        <span className="font-medium">
                          {module.module_id}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          Display Order
                        </span>

                        <span className="font-medium">
                          {module.display_order}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          Note
                        </span>

                        <span className="max-w-[180px] truncate font-medium">
                          {module.note ?? "-"}
                        </span>
                      </div>

                    </div>

                    {/* PERMISSIONS */}

                    <div className="mt-4">

                      <p className="mb-2 text-sm font-medium">
                        Permissions
                      </p>

                      <div className="grid grid-cols-2 gap-2">

                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">
                            Org Admin
                          </p>

                          <p className="mt-1 text-xs font-medium">
                            {
                              getPermissionLabel(
                                orgAdminPermission
                              )
                            }
                          </p>
                        </div>

                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">
                            Temple Admin
                          </p>

                          <p className="mt-1 text-xs font-medium">
                            {
                              getPermissionLabel(
                                templeAdminPermission
                              )
                            }
                          </p>
                        </div>

                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">
                            User
                          </p>

                          <p className="mt-1 text-xs font-medium">
                            {
                              getPermissionLabel(
                                userPermission
                              )
                            }
                          </p>
                        </div>

                        <div className="rounded-md bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">
                            Staff
                          </p>

                          <p className="mt-1 text-xs font-medium">
                            {
                              getPermissionLabel(
                                staffPermission
                              )
                            }
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex justify-end gap-2 border-t pt-4">

                      {/* <Button
                        variant="outline"
                        size="sm"
                      
                      >
                        <NavLink
                          to={`/submodule/view/${module.id}`}
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </NavLink>
                      </Button> */}

                      <Button
                        size="sm"
                    
                      >
                        <NavLink
                          to={`/submodule/edit/${module.id}`}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </NavLink>
                      </Button>

                      <AlertDialog>

                        <AlertDialogTrigger
                         
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent
                          size="sm"
                        >

                          <AlertDialogHeader>

                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                              <Trash2 className="size-5" />
                            </AlertDialogMedia>

                            <AlertDialogTitle>
                              Delete Sub Module?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                              Are you sure you
                              want to delete{" "}
                              <span className="font-semibold text-foreground">
                                {
                                  module.sub_module_name
                                }
                              </span>
                              ? This action
                              cannot be undone.
                            </AlertDialogDescription>

                          </AlertDialogHeader>

                          <AlertDialogFooter>

                            <AlertDialogCancel
                              variant="outline"
                            >
                              Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                              variant="destructive"
                              onClick={() =>
                                void handleDelete(
                                  module.id
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
                )
              }
            )

          )}

        </div>
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

              {/* PREVIOUS */}

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

              {/* PAGE NUMBERS */}

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

              {/* NEXT */}

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