
// "use client"

// import {
//   useEffect,
//   useMemo,
//   useState,
// } from "react"

// import {
//   List,
//   LayoutGrid,
//   Pencil,
//   Eye,
//   Trash2,
// } from "lucide-react"

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogMedia,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"

// import {
//   NavLink,
// } from "react-router-dom"

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux"

// import type {
//   AppDispatch,
// } from "@/app/store"

// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableHead,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table"

// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination"

// import {
//   Button,
// } from "@/components/ui/button"

// import {
//   selectRoles,
//   selectRolesLoading,
//   selectRolesError,
// } from "../roleSelectors"

// import {
//   fetchRoles,
//   deleteRole,
// } from "../roleThunks"

// /* =========================================================
//    FRONTEND PAGE SIZE
// ========================================================= */

// const PAGE_SIZE = 10

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function RolesTable() {
//   const dispatch = useDispatch<AppDispatch>()

//   /* =========================================================
//      REDUX
//   ========================================================= */

//   const roles = useSelector(
//     selectRoles,
//   )

//   const loading = useSelector(
//     selectRolesLoading,
//   )

//   const error = useSelector(
//     selectRolesError,
//   )

//   /* =========================================================
//      LOCAL STATE
//   ========================================================= */

//   const [
//     currentPage,
//     setCurrentPage,
//   ] = useState(1)

//   const [
//     view,
//     setView,
//   ] = useState<
//     "list" | "grid"
//   >("list")

//   /* =========================================================
//      FETCH ALL ROLES
     
//      IMPORTANT:
//      No page / limit because backend does
//      NOT support pagination.
//   ========================================================= */

//   useEffect(() => {
//     void dispatch(
//       fetchRoles(),
//     )
//   }, [dispatch])

//   /* =========================================================
//      FRONTEND PAGINATION
//   ========================================================= */

//   const totalRoles =
//     roles.length

//   const totalPages =
//     Math.ceil(
//       totalRoles /
//         PAGE_SIZE,
//     )

//   /*
//    * If a role is deleted and the current
//    * page becomes invalid, move to the
//    * previous page.
//    */

//   useEffect(() => {
//     if (
//       totalPages > 0 &&
//       currentPage > totalPages
//     ) {
//       setCurrentPage(
//         totalPages,
//       )
//     }

//     if (
//       totalPages === 0 &&
//       currentPage !== 1
//     ) {
//       setCurrentPage(1)
//     }
//   }, [
//     totalPages,
//     currentPage,
//   ])

//   /* =========================================================
//      CURRENT PAGE ROLES
//   ========================================================= */

//   const currentRoles =
//     useMemo(() => {
//       const startIndex =
//         (currentPage - 1) *
//         PAGE_SIZE

//       const endIndex =
//         startIndex +
//         PAGE_SIZE

//       return roles.slice(
//         startIndex,
//         endIndex,
//       )
//     }, [
//       roles,
//       currentPage,
//     ])

//   /* =========================================================
//      PAGE CHANGE
//   ========================================================= */

//   const handlePageChange = (
//     page: number,
//   ) => {
//     if (
//       page < 1 ||
//       page > totalPages
//     ) {
//       return
//     }

//     setCurrentPage(page)
//   }

//   /* =========================================================
//      DELETE ROLE
//   ========================================================= */

//   const handleDelete = async (
//     id: number,
//   ) => {
//     try {
//       const result =
//         await dispatch(
//           deleteRole(id),
//         )

//       if (
//         deleteRole.rejected.match(
//           result,
//         )
//       ) {
//         console.error(
//           result.payload,
//         )

//         return
//       }

//       /*
//        * Refresh the complete role list
//        * because pagination is frontend based.
//        */

//       await dispatch(
//         fetchRoles(),
//       )
//     } catch (error) {
//       console.error(
//         "Delete role failed:",
//         error,
//       )
//     }
//   }

//   /* =========================================================
//      LOADING
//   ========================================================= */

//   if (
//     loading &&
//     roles.length === 0
//   ) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center">

//         <p className="text-sm text-muted-foreground">
//           Loading roles...
//         </p>

//       </div>
//     )
//   }

//   /* =========================================================
//      ERROR
//   ========================================================= */

//   if (
//     error &&
//     roles.length === 0
//   ) {
//     return (
//       <div className="rounded-md border border-destructive/30 p-6 text-center">

//         <p className="text-sm text-destructive">
//           {error}
//         </p>

//         <Button
//           className="mt-4"
//           onClick={() => {
//             void dispatch(
//               fetchRoles(),
//             )
//           }}
//         >
//           Try Again
//         </Button>

//       </div>
//     )
//   }

//   /* =========================================================
//      DISPLAY RANGE
//   ========================================================= */

//   const firstItem =
//     totalRoles === 0
//       ? 0
//       : (currentPage - 1) *
//           PAGE_SIZE +
//         1

//   const lastItem =
//     Math.min(
//       currentPage *
//         PAGE_SIZE,
//       totalRoles,
//     )

//   /* =========================================================
//      RETURN
//   ========================================================= */

//   return (
//     <div className="w-full space-y-4">

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div className="flex items-center justify-between">

//         {/* ADD ROLE */}

//         <div>

//           <NavLink to="/roles/add">

//             <Button className="cursor-pointer">
//               Add Role
//             </Button>

//           </NavLink>

//         </div>

//         {/* LIST / GRID */}

//         <div className="flex items-center gap-1 rounded-md border p-1">

//           <Button
//             className="cursor-pointer"
//             type="button"
//             variant={
//               view === "list"
//                 ? "default"
//                 : "ghost"
//             }
//             size="icon"
//             onClick={() =>
//               setView("list")
//             }
//             title="List View"
//           >
//             <List className="size-4" />
//           </Button>

//           <Button
//             className="cursor-pointer"
//             type="button"
//             variant={
//               view === "grid"
//                 ? "default"
//                 : "ghost"
//             }
//             size="icon"
//             onClick={() =>
//               setView("grid")
//             }
//             title="Grid View"
//           >
//             <LayoutGrid className="size-4" />
//           </Button>

//         </div>

//       </div>

//       {/* =====================================================
//           LIST VIEW
//       ===================================================== */}

//       {view === "list" && (

//         <div className="overflow-hidden rounded-md border">

//           <Table>

//             {/* HEADER */}

//             <TableHeader>

//               <TableRow>

//                 <TableHead>
//                   Sl.no
//                 </TableHead>

//                 <TableHead>
//                  User Role Name
//                 </TableHead>

//                 <TableHead>
//                 User  Role 
//                 </TableHead>


//                 <TableHead className="text-right">
//                   Actions
//                 </TableHead>

//               </TableRow>

//             </TableHeader>

//             {/* BODY */}

//             <TableBody>

//               {currentRoles.length === 0 ? (

//                 <TableRow>

//                   <TableCell
//                     colSpan={5}
//                     className="h-24 text-center"
//                   >
//                     No roles found.
//                   </TableCell>

//                 </TableRow>

//               ) : (

//                 currentRoles.map(
//                   (
//                     role,
//                     index,
//                   ) => (

//                     <TableRow
//                       key={role.id}
//                     >

//                       {/* SL NO */}

//                       <TableCell>

//                         {(currentPage - 1) *
//                           PAGE_SIZE +
//                           index +
//                           1}

//                       </TableCell>

//                       {/* ROLE NAME */}

//                       <TableCell className="font-medium capitalize">

//                         {role.user_role_name}

//                       </TableCell>

//                       {/* ROLE CODE */}

//                       <TableCell className="capitalize">

//                         {role.user_role ||
//                           "-"}

//                       </TableCell>

//                       {/* STATUS */}

                     

//                       {/* ACTIONS */}

//                       <TableCell>

//                         <div className="flex justify-end gap-1">

//                           {/* VIEW */}

//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             title="View"
                           
//                           >

//                             <NavLink
                              
//                                to={`/roles/view/${role.id}`}
//                             >

//                               <Eye className="size-4" />

//                             </NavLink>

//                           </Button>

//                           {/* EDIT */}

//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             title="Edit"
                           
//                           >

//                             <NavLink
//                               to={`/roles/edit/${role.id}`}
                             
//                             >

//                               <Pencil className="size-4" />

//                             </NavLink>

//                           </Button>

//                           {/* DELETE */}

//                           <AlertDialog>

//                             <AlertDialogTrigger
//                               render={
//                                 <Button
//                                   type="button"
//                                   className="cursor-pointer"
//                                   variant="ghost"
//                                   size="icon"
//                                   title="Delete"
//                                 />
//                               }
//                             >

//                               <Trash2 className="size-4 text-destructive" />

//                             </AlertDialogTrigger>

//                             <AlertDialogContent size="sm">

//                               <AlertDialogHeader>

//                                 <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

//                                   <Trash2 className="size-5" />

//                                 </AlertDialogMedia>

//                                 <AlertDialogTitle>
//                                   Delete Role?
//                                 </AlertDialogTitle>

//                                 <AlertDialogDescription>

//                                   Are you sure you
//                                   want to delete{" "}

//                                   <span className="font-semibold text-foreground">

//                                     {
//                                       role.user_role_name
//                                     }

//                                   </span>

//                                   ? This action
//                                   cannot be undone.

//                                 </AlertDialogDescription>

//                               </AlertDialogHeader>

//                               <AlertDialogFooter>

//                                 <AlertDialogCancel
//                                   variant="outline"
//                                   className="cursor-pointer"
//                                 >
//                                   Cancel
//                                 </AlertDialogCancel>

//                                 <AlertDialogAction
//                                   className="cursor-pointer"
//                                   variant="destructive"
//                                   onClick={() =>
//                                     handleDelete(
//                                       role.id,
//                                     )
//                                   }
//                                 >
//                                   Delete
//                                 </AlertDialogAction>

//                               </AlertDialogFooter>

//                             </AlertDialogContent>

//                           </AlertDialog>

//                         </div>

//                       </TableCell>

//                     </TableRow>

//                   ),
//                 )

//               )}

//             </TableBody>

//           </Table>

//         </div>

//       )}

//       {/* =====================================================
//           GRID VIEW
//       ===================================================== */}

//       {view === "grid" && (

//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

//           {currentRoles.length === 0 ? (

//             <div className="col-span-full rounded-md border p-8 text-center">

//               <p className="text-sm text-muted-foreground">
//                 No roles found.
//               </p>

//             </div>

//           ) : (

//             currentRoles.map(
//               (
//                 role,
//                 index,
//               ) => (

//                 <div
//                   key={role.id}
//                   className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
//                 >

//                   {/* CARD HEADER */}

//                   <div className="flex items-start justify-between gap-3">

//                     <div className="min-w-0">

//                       <p className="text-xs text-muted-foreground">

//                         #
//                         {(currentPage - 1) *
//                           PAGE_SIZE +
//                           index +
//                           1}

//                       </p>

//                       <h3 className="mt-1 truncate font-semibold capitalize">

//                         {
//                           role.user_role_name
//                         }

//                       </h3>

//                       <p className="mt-1 text-sm text-muted-foreground">

//                         {
//                           role.user_role ||
//                           "-"
//                         }

//                       </p>

//                     </div>

                    

//                   </div>

//                   {/* DETAILS */}

//                   <div className="mt-4 space-y-3">

//                     <div className="rounded-md bg-muted/50 p-3">

//                       <p className="text-xs text-muted-foreground">
                     
//                         User Role Name
//                       </p>

//                       <p className="mt-1 font-semibold capitalize">

//                         {
//                           role.user_role_name
//                         }

//                       </p>

//                     </div>

//                     <div className="rounded-md bg-muted/50 p-3">

//                       <p className="text-xs text-muted-foreground">
//                        User Role
//                       </p>

//                       <p className="mt-1 font-semibold">

//                         {
//                           role.user_role ||
//                           "-"
//                         }

//                       </p>

//                     </div>

//                   </div>

//                   {/* ACTIONS */}

//                   <div className="mt-5 flex justify-end gap-2 border-t pt-4">

//                     <Button
//                       variant="outline"
//                       size="sm"
                    
//                     >

//                       <NavLink
//                         to={`/roles/${role.id}`}
//                       >

//                         <Eye className="mr-2 size-4" />

//                         View

//                       </NavLink>

//                     </Button>

//                     <Button
//                       size="sm"
                    
//                     >

//                       <NavLink
//                         to={`/roles/${role.id}/edit`}
//                       >

//                         <Pencil className="mr-2 size-4" />

//                         Edit

//                       </NavLink>

//                     </Button>

//                     <AlertDialog>

//                       <AlertDialogTrigger
//                         render={
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="icon"
//                             title="Delete"
//                           />
//                         }
//                       >

//                         <Trash2 className="size-4 text-destructive" />

//                       </AlertDialogTrigger>

//                       <AlertDialogContent size="sm">

//                         <AlertDialogHeader>

//                           <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

//                             <Trash2 className="size-5" />

//                           </AlertDialogMedia>

//                           <AlertDialogTitle>
//                             Delete Role?
//                           </AlertDialogTitle>

//                           <AlertDialogDescription>

//                             Are you sure you
//                             want to delete{" "}

//                             <span className="font-semibold text-foreground">

//                               {
//                                 role.user_role_name
//                               }

//                             </span>

//                             ? This action cannot
//                             be undone.

//                           </AlertDialogDescription>

//                         </AlertDialogHeader>

//                         <AlertDialogFooter>

//                           <AlertDialogCancel
//                             variant="outline"
//                           >
//                             Cancel
//                           </AlertDialogCancel>

//                           <AlertDialogAction
//                             variant="destructive"
//                             onClick={() =>
//                               handleDelete(
//                                 role.id,
//                               )
//                             }
//                           >
//                             Delete
//                           </AlertDialogAction>

//                         </AlertDialogFooter>

//                       </AlertDialogContent>

//                     </AlertDialog>

//                   </div>

//                 </div>

//               ),
//             )

//           )}

//         </div>

//       )}

//       {/* =====================================================
//           FRONTEND PAGINATION
//       ===================================================== */}

//       {totalRoles > 0 && (

//         <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

//           {/* SHOWING */}

//           <div className="text-sm text-muted-foreground">

//             Showing{" "}
//             {firstItem}{" "}
//             to{" "}
//             {lastItem}{" "}
//             of{" "}
//             {totalRoles}{" "}
//             roles

//           </div>

//           {/* PAGINATION */}

//           {totalPages > 1 && (

//             <Pagination className="mx-0 w-auto">

//               <PaginationContent>

//                 {/* PREVIOUS */}

//                 <PaginationItem>

//                   <PaginationPrevious
//                     href="#"
//                     onClick={(event) => {
//                       event.preventDefault()

//                       handlePageChange(
//                         currentPage - 1,
//                       )
//                     }}
//                     className={
//                       currentPage === 1
//                         ? "pointer-events-none opacity-50"
//                         : "cursor-pointer"
//                     }
//                   />

//                 </PaginationItem>

//                 {/* PAGE NUMBERS */}

//                 {Array.from(
//                   {
//                     length:
//                       totalPages,
//                   },
//                   (_, index) => {

//                     const page =
//                       index + 1

//                     return (
//                       <PaginationItem
//                         key={page}
//                       >

//                         <PaginationLink
//                           href="#"
//                           isActive={
//                             currentPage ===
//                             page
//                           }
//                           onClick={(event) => {
//                             event.preventDefault()

//                             handlePageChange(
//                               page,
//                             )
//                           }}
//                         >

//                           {page}

//                         </PaginationLink>

//                       </PaginationItem>
//                     )
//                   },
//                 )}

//                 {/* NEXT */}

//                 <PaginationItem>

//                   <PaginationNext
//                     href="#"
//                     onClick={(event) => {
//                       event.preventDefault()

//                       handlePageChange(
//                         currentPage + 1,
//                       )
//                     }}
//                     className={
//                       currentPage ===
//                       totalPages
//                         ? "pointer-events-none opacity-50"
//                         : "cursor-pointer"
//                     }
//                   />

//                 </PaginationItem>

//               </PaginationContent>

//             </Pagination>

//           )}

//         </div>

//       )}

//     </div>
//   )
// }




"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

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

import {
  Button,
} from "@/components/ui/button"

import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../roleSelectors"

import {
  fetchRoles,
  deleteRole,
} from "../roleThunks"


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


  /* =========================================================
     FETCH ALL ROLES

     Backend does NOT use pagination.
     All roles are fetched once.
  ========================================================= */

  useEffect(() => {

    void dispatch(
      fetchRoles(),
    )

  }, [
    dispatch,
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

  const handleDelete = async (
    id: number,
  ) => {

    try {

      const result =
        await dispatch(
          deleteRole(id),
        )


      if (
        deleteRole.rejected.match(
          result,
        )
      ) {

        console.error(
          result.payload,
        )

        return
      }


      /*
        Refresh complete role list
        because pagination is frontend based.
      */

      await dispatch(
        fetchRoles(),
      )

    } catch (error) {

      console.error(
        "Delete role failed:",
        error,
      )

    }
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    roles.length === 0
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
              fetchRoles(),
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

      <div className="flex items-center justify-between">

        {/* ADD ROLE */}

        <div>

          <NavLink to="/roles/add">

            <Button className="cursor-pointer">
              Add Role
            </Button>

          </NavLink>

        </div>


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


      {/* =====================================================
          LIST VIEW
      ===================================================== */}

      {view === "list" && (

        <div className="overflow-hidden rounded-md border">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  User Role Name
                </TableHead>

                <TableHead>
                  User Role
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>


            <TableBody>

              {currentRoles.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={4}
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
                    >

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

                        <div className="flex justify-end gap-1">

                          {/* VIEW */}

                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                          >

                            <NavLink
                              to={`/roles/view/${role.id}`}
                            >

                              <Eye className="size-4" />

                            </NavLink>

                          </Button>


                          {/* EDIT */}

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                          >

                            <NavLink
                              to={`/roles/edit/${role.id}`}
                            >

                              <Pencil className="size-4" />

                            </NavLink>

                          </Button>


                          {/* DELETE */}

                          <AlertDialog>

                            <AlertDialogTrigger
                              render={
                                <Button
                                  type="button"
                                  className="cursor-pointer"
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                />
                              }
                            >

                              <Trash2 className="size-4 text-destructive" />

                            </AlertDialogTrigger>


                            <AlertDialogContent size="sm">

                              <AlertDialogHeader>

                                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

                                  <Trash2 className="size-5" />

                                </AlertDialogMedia>


                                <AlertDialogTitle>
                                  Delete Role?
                                </AlertDialogTitle>


                                <AlertDialogDescription>

                                  Are you sure you
                                  want to delete{" "}

                                  <span className="font-semibold text-foreground">

                                    {
                                      role.user_role_name
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
                                    handleDelete(
                                      role.id,
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


      {/* =====================================================
          GRID VIEW
      ===================================================== */}

      {view === "grid" && (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {currentRoles.length === 0 ? (

            <div className="col-span-full rounded-md border p-8 text-center">

              <p className="text-sm text-muted-foreground">
                No roles found.
              </p>

            </div>

          ) : (

            currentRoles.map(
              (
                role,
                index,
              ) => (

                <div
                  key={role.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs text-muted-foreground">

                        #
                        {(effectivePage - 1) *
                          PAGE_SIZE +
                          index +
                          1}

                      </p>


                      <h3 className="mt-1 truncate font-semibold capitalize">

                        {
                          role.user_role_name
                        }

                      </h3>


                      <p className="mt-1 text-sm text-muted-foreground">

                        {
                          role.user_role ||
                          "-"
                        }

                      </p>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="mt-4 space-y-3">

                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        User Role Name
                      </p>

                      <p className="mt-1 font-semibold capitalize">

                        {
                          role.user_role_name
                        }

                      </p>

                    </div>


                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        User Role
                      </p>

                      <p className="mt-1 font-semibold">

                        {
                          role.user_role ||
                          "-"
                        }

                      </p>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="mt-5 flex justify-end gap-2 border-t pt-4">

                    <Button
                      variant="outline"
                      size="sm"
                    >

                      <NavLink
                        to={`/roles/view/${role.id}`}
                        className="flex items-center"
                      >

                        <Eye className="mr-2 size-4" />

                        View

                      </NavLink>

                    </Button>


                    <Button
                      size="sm"
                    >

                      <NavLink
                        to={`/roles/edit/${role.id}`}
                        className="flex items-center"
                      >

                        <Pencil className="mr-2 size-4" />

                        Edit

                      </NavLink>

                    </Button>


                    <AlertDialog>

                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Delete"
                          />
                        }
                      >

                        <Trash2 className="size-4 text-destructive" />

                      </AlertDialogTrigger>


                      <AlertDialogContent size="sm">

                        <AlertDialogHeader>

                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

                            <Trash2 className="size-5" />

                          </AlertDialogMedia>


                          <AlertDialogTitle>
                            Delete Role?
                          </AlertDialogTitle>


                          <AlertDialogDescription>

                            Are you sure you
                            want to delete{" "}

                            <span className="font-semibold text-foreground">

                              {
                                role.user_role_name
                              }

                            </span>

                            ? This action cannot
                            be undone.

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
                              handleDelete(
                                role.id,
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