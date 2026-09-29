
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
  selectModules,
  selectModulesLoading,
  selectModulesError,
  selectModulesPagination,
} from "../modulesSelectors"

import {
  fetchModules,
  removeModule,
} from "../moduleThunks"

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

  /* ------------------------------------------------------------------------ */
  /* Fetch Modules                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    void dispatch(
      fetchModules({
        page: currentPage,
        limit: PAGE_SIZE,
      })
    )
  }, [dispatch, currentPage])

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

  const handleDelete = async (
    id: number
  ) => {
    const result = await dispatch(
      removeModule(id)
    )

    if (
      removeModule.rejected.match(result)
    ) {
      console.error(result.payload)
      return
    }

    /*
     * If the last item on the current page
     * was deleted, go back one page.
     */
    if (
      modules.length === 1 &&
      currentPage > 1
    ) {
      setCurrentPage(
        (page) => page - 1
      )
    } else {
      /*
       * Refresh current page because
       * backend pagination has changed.
       */
      void dispatch(
        fetchModules({
          page: currentPage,
          limit: PAGE_SIZE,
        })
      )
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    loading &&
    modules.length === 0
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
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

      <div className="flex items-center justify-between">

        <div>
          <NavLink to="/modules/add">
            <Button className="cursor-pointer">
              Add Module
            </Button>
          </NavLink>
          {/* {modules.length >= 1 && (
            <NavLink to="/modules/sub/add">
              <Button className="cursor-pointer">
                Add Sub Module
              </Button>
            </NavLink>
          )} */}
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

      {/* ================================================================== */}
      {/* LIST VIEW                                                          */}
      {/* ================================================================== */}

      {view === "list" && (
        <div className="overflow-hidden rounded-md border">

          <Table>

            <TableHeader>
              <TableRow>

                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  Module Name
                </TableHead>

                <TableHead>
                  Code
                </TableHead>

                <TableHead>
                  Module Type
                </TableHead>

                <TableHead>
                  Capacity Type
                </TableHead>

                <TableHead>
                  Consumable Type
                </TableHead>

                <TableHead>
                  Display Order
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
                    colSpan={9}
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
                    >

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

                      <TableCell>
                        {module.display_order}
                      </TableCell>

                      <TableCell>

                        <span
                          className={
                            module.status ===
                            "active"
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 capitalize"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 capitalize"
                          }
                        >
                          {module.status}
                        </span>

                      </TableCell>

                      {/* Actions */}

                      <TableCell>
                        <div className="flex justify-end gap-1">

                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                          
                          >
                            <NavLink
                              to={`/modules/view/${module.id}`}
                            >
                              <Eye className="size-4" />
                            </NavLink>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                           
                          >
                            <NavLink
                              to={`/modules/edit/${module.id}`}
                            >
                              <Pencil className="size-4" />
                            </NavLink>
                          </Button>

                          <AlertDialog>

                            <AlertDialogTrigger
                          
                            >
                              <Button
                               className="cursor-pointer"
                                variant="ghost"
                                size="icon"
                                title="Delete"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">

                              <AlertDialogHeader>

                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                                  <Trash2 className="size-5" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>
                                  Delete Module?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  Are you sure you
                                  want to delete{" "}
                                  <span className="font-semibold text-foreground">
                                    {module.module_name}
                                  </span>
                                  ? This action
                                  cannot be undone.
                                </AlertDialogDescription>

                              </AlertDialogHeader>

                              <AlertDialogFooter>

                                <AlertDialogCancel variant="outline"  className="cursor-pointer">
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                 className="cursor-pointer"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDelete(
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
                No modules found.
              </p>
            </div>
          ) : (
            modules.map(
              (module, index) => (
                <div
                  key={module.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >

                  {/* Card Header */}

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
                        {module.module_name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {module.module_code}
                      </p>

                    </div>

                    <span
                      className={
                        module.status ===
                        "active"
                          ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {module.status}
                    </span>

                  </div>

                  {/* Stats */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        Module Type
                      </p>

                      <p className="mt-1 text-lg font-semibold capitalize">
                        {module.module_type}
                      </p>

                    </div>

                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        Capacity Type
                      </p>

                      <p className="mt-1 text-lg font-semibold capitalize">
                        {module.capacity_type ??
                          "-"}
                      </p>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        Consumable Type
                      </span>

                      <span className="font-medium">
                        {module.consumable_type ??
                          "-"}
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
                        Status
                      </span>

                      <span className="font-medium capitalize">
                        {module.status}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="mt-5 flex justify-end gap-2 border-t pt-4">

                    <Button
                      variant="outline"
                      size="sm"
                     
                    >
                      <NavLink
                        to={`/modules/view/${module.id}`}
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </NavLink>
                    </Button>

                    <Button
                      size="sm"
                      
                    >
                      <NavLink
                        to={`/modules/edit/${module.id}`}
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

                      <AlertDialogContent size="sm">

                        <AlertDialogHeader>

                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                            <Trash2 className="size-5" />
                          </AlertDialogMedia>

                          <AlertDialogTitle>
                            Delete Module?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Are you sure you
                            want to delete{" "}
                            <span className="font-semibold text-foreground">
                              {module.module_name}
                            </span>
                            ? This action cannot be
                            undone.
                          </AlertDialogDescription>

                        </AlertDialogHeader>

                        <AlertDialogFooter>

                          <AlertDialogCancel variant="outline">
                            Cancel
                          </AlertDialogCancel>

                          <AlertDialogAction
                            variant="destructive"
                            onClick={() =>
                              handleDelete(
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
            )
          )}

        </div>
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