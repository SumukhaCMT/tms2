  
"use client"

import {
  useEffect,
} from "react"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  useParams,
} from "react-router-dom"

import {
  ShieldCheck,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"

import type {
  AppDispatch,
} from "@/app/store"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  fetchRoleById,
} from "../roleThunks"

import {
  selectSelectedRole,
  selectRolesLoading,
} from "../roleSelectors"

import {
  fetchSubModules,
} from "../../sub_modules/submoduleThunks"

import {
  selectSubModules,
  selectSubModulesLoading,
} from "../../sub_modules/submoduleSelectors"


/* =========================================================
   PERMISSION HELPERS
========================================================= */

const getPermissions = (
 permission: number,
): string[] => {

  const permissions: string[] = []

  /*
    Permission values:

    0 = View
    1 = View + Delete
    2 = View + Edit
    3 = View + Edit + Delete
    4 = View + Add
    5 = View + Add + Delete
    6 = View + Add + Edit
    7 = View + Add + Edit + Delete
  */

  // View permission
  permissions.push("View")

  // Add
  if ((permission & 4) !== 0) {
    permissions.push("Add")
  }

  // Edit
  if ((permission & 2) !== 0) {
    permissions.push("Edit")
  }

  // Delete
  if ((permission & 1) !== 0) {
    permissions.push("Delete")
  }

  return permissions
}


/* =========================================================
   PERMISSION ICON
========================================================= */

function PermissionIcon({
  permission,
}: {
  permission: string
}) {

  if (permission === "Add") {
    return <Plus className="size-3.5" />
  }

  if (permission === "Edit") {
    return <Pencil className="size-3.5" />
  }

  if (permission === "Delete") {
    return <Trash2 className="size-3.5" />
  }

  return <Eye className="size-3.5" />
}


/* =========================================================
   VIEW ROLE
========================================================= */

export default function ViewRole() {

  const {
    id,
  } = useParams<{
    id: string
  }>()

  const dispatch =
    useDispatch<AppDispatch>()


  const role =
    useSelector(
      selectSelectedRole,
    )

  const loading =
    useSelector(
      selectRolesLoading,
    )

  const subModules =
    useSelector(
      selectSubModules,
    )

  const subModulesLoading =
    useSelector(
      selectSubModulesLoading,
    )


  /* =======================================================
     FETCH DATA
  ======================================================= */

  useEffect(() => {

    if (!id) {
      return
    }

    void dispatch(
      fetchRoleById(
        Number(id),
      ),
    )

    void dispatch(
      fetchSubModules({}),
    )

  }, [
    dispatch,
    id,
  ])


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading ||
    subModulesLoading
  ) {

    return (

      <div
        className="
          py-10
          text-center
          text-sm
          text-muted-foreground
        "
      >
        Loading role...
      </div>

    )
  }


  /* =======================================================
     ROLE NOT FOUND
  ======================================================= */

  if (!role) {

    return (

      <div
        className="
          py-10
          text-center
          text-sm
          text-muted-foreground
        "
      >
        Role not found.
      </div>

    )
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (

    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            border
            bg-muted
          "
        >

          <ShieldCheck
            className="h-5 w-5"
          />

        </div>


        <div>

          <h1
            className="
              text-2xl
              font-semibold
            "
          >
            {role.user_role_name}
          </h1>

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Role details and permissions
          </p>

        </div>

      </div>


      {/* ===================================================
          ROLE INFORMATION
      =================================================== */}

      <Card>

        <CardHeader>

          <CardTitle>
            Role Information
          </CardTitle>

        </CardHeader>


        <CardContent
          className="
            grid
            gap-6
            sm:grid-cols-2
          "
        >

          {/* USER ROLE NAME */}

          <div>

            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              User Role Name
            </p>

            <p
              className="
                mt-1
                font-medium
              "
            >
              {role.user_role_name}
            </p>

          </div>


          {/* USER ROLE */}

          <div>

            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              User Role
            </p>

            <p
              className="
                mt-1
                font-medium
              "
            >
              {role.user_role || "-"}
            </p>

          </div>

        </CardContent>

      </Card>


      {/* ===================================================
          PERMISSIONS
      =================================================== */}

      <Card>

        <CardHeader>

          <CardTitle>
            Permissions
          </CardTitle>

        </CardHeader>


        <CardContent>

          {role.permissions.length === 0 ? (

            <div
              className="
                rounded-md
                border
                p-6
                text-center
                text-sm
                text-muted-foreground
              "
            >
              No permissions assigned.
            </div>

          ) : (

            <div
              className="
                overflow-hidden
                rounded-md
                border
              "
            >

              {/* TABLE HEADER */}

              <div
                className="
                  hidden
                  grid-cols-[1fr_2fr]
                  border-b
                  bg-muted/50
                  px-4
                  py-3
                  text-sm
                  font-medium
                  md:grid
                "
              >

                <div>
                  Submodule
                </div>

                <div>
                  Permissions
                </div>

              </div>


              {/* PERMISSION ROWS */}

              {role.permissions.map(
                (
                  permission,
                ) => {

                  const subModule =
                    subModules.find(
                      (
                        item,
                      ) =>
                        item.id ===
                        permission.sub_module_id,
                    )


                  const permissions =
                    getPermissions(
                      permission.permission,
                    )


                  return (

                    <div
                      key={
                        permission.sub_module_id
                      }
                      className="
                        grid
                        gap-3
                        border-b
                        px-4
                        py-4
                        last:border-b-0
                        md:grid-cols-[1fr_2fr]
                        md:items-center
                      "
                    >

                      {/* SUBMODULE */}

                      <div>

                        <p
                          className="
                            text-xs
                            text-muted-foreground
                            md:hidden
                          "
                        >
                          Submodule
                        </p>

                        <p
                          className="
                            font-medium
                          "
                        >

                          {
                            subModule?.sub_module_name ??
                            `Submodule ${permission.sub_module_id}`
                          }

                        </p>

                      </div>


                      {/* PERMISSIONS */}

                      <div>

                        <p
                          className="
                            mb-2
                            text-xs
                            text-muted-foreground
                            md:hidden
                          "
                        >
                          Permissions
                        </p>


                        <div
                          className="
                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          {permissions.map(
                            (
                              permissionName,
                            ) => (

                              <span
                                key={
                                  permissionName
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-md
                                  border
                                  bg-muted/40
                                  px-2.5
                                  py-1.5
                                  text-xs
                                  font-medium
                                "
                              >

                                <PermissionIcon
                                  permission={
                                    permissionName
                                  }
                                />

                                {permissionName}

                              </span>

                            ),
                          )}

                        </div>

                      </div>

                    </div>

                  )

                },
              )}

            </div>

          )}

        </CardContent>

      </Card>

    </div>

  )
}
