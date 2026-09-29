"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useForm,
} from "@tanstack/react-form"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import {
  Input,
} from "@/components/ui/input"

import {
  Check,
  ChevronsUpDown,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Badge,
} from "@/components/ui/badge"


/* =========================================================
   ROLE PERMISSION
========================================================= */

export type RolePermission = {
  role_id: number
  permission: number
}


/* =========================================================
   SUBMODULE
========================================================= */

export type SubModule = {
  id: number
  sub_module_name: string
  sub_module_code?: string
}


/* =========================================================
   ROLE FORM DATA
========================================================= */

export type RoleFormData = {
  role_name: string
  submodule_ids: number[]
  permissions: RolePermission[]
}


/* =========================================================
   PROPS
========================================================= */

interface RoleFormProps {
  initialData?: Partial<RoleFormData> & {
    id?: number
  }

  subModules: SubModule[]

  loading?: boolean

  onSubmit: (
    data: RoleFormData,
  ) => Promise<void> | void

  onCancel?: () => void
}


/* =========================================================
   PERMISSION TYPE
========================================================= */

type PermissionType =
  | "view"
  | "add"
  | "edit"
  | "delete"


/* =========================================================
   ROLE ID
========================================================= */

const ROLE_ID = 4


/* =========================================================
   PERMISSION VALUES
========================================================= */

const PERMISSION = {
  ADD: 4,
  EDIT: 2,
  DELETE: 1,
} as const


/* =========================================================
   DEFAULT PERMISSIONS
========================================================= */

const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    role_id: ROLE_ID,
    permission: 0,
  },
]


/* =========================================================
   GET PERMISSION
========================================================= */

function getPermission(
  permissions: RolePermission[],
  roleId: number,
): number {

  return (
    permissions.find(
      (item) =>
        item.role_id === roleId,
    )?.permission ?? 0
  )
}


/* =========================================================
   HAS PERMISSION
========================================================= */

function hasPermission(
  permission: number,
  type: PermissionType,
): boolean {

  if (type === "view") {
    return true
  }

  const bit =
    type === "add"
      ? PERMISSION.ADD
      : type === "edit"
        ? PERMISSION.EDIT
        : PERMISSION.DELETE

  return (
    (permission & bit) === bit
  )
}


/* =========================================================
   CALCULATE PERMISSION
========================================================= */

function calculatePermission(
  currentPermission: number,
  type: PermissionType,
): number {

  if (type === "view") {
    return currentPermission
  }

  const bit =
    type === "add"
      ? PERMISSION.ADD
      : type === "edit"
        ? PERMISSION.EDIT
        : PERMISSION.DELETE

  const enabled =
    (currentPermission & bit) === bit

  if (enabled) {
    return currentPermission & ~bit
  }

  return currentPermission | bit
}


/* =========================================================
   ROLE FORM
========================================================= */

export default function RoleForm({
  initialData,
  subModules,
  loading = false,
  onSubmit,
  onCancel,
}: RoleFormProps) {

  /* =======================================================
     EDIT MODE
  ======================================================= */

  const isEditMode =
    Boolean(initialData?.id)


  /* =======================================================
     FORM
  ======================================================= */

  const form = useForm({

    defaultValues: {

      role_name:
        initialData?.role_name ?? "",

      submodule_ids:
        initialData?.submodule_ids ?? [],

      permissions:
        initialData?.permissions ??
        DEFAULT_PERMISSIONS,

    } satisfies RoleFormData,

    onSubmit: async ({
      value,
    }) => {

      await onSubmit({

        role_name:
          value.role_name.trim(),

        submodule_ids:
          value.submodule_ids,

        permissions:
          value.permissions,

      })
    },
  })


  /* =======================================================
     RESET FORM
  ======================================================= */

  useEffect(() => {

    if (!initialData) {
      return
    }

    form.reset({

      role_name:
        initialData.role_name ?? "",

      submodule_ids:
        initialData.submodule_ids ?? [],

      permissions:
        initialData.permissions ??
        DEFAULT_PERMISSIONS,

    })

  }, [initialData, form])


  /* =======================================================
     ROLE NAME
  ======================================================= */

  const currentRoleName =
    form.getFieldValue(
      "role_name",
    ) || "Role"


  /* =======================================================
     RETURN
  ======================================================= */

  return (

    <Card className="w-full">

      {/* ===================================================
          HEADER
      =================================================== */}

      <CardHeader className="border-b">

        <CardTitle className="text-xl">

          {isEditMode
            ? "Edit Role"
            : "Create Role"}

        </CardTitle>

      </CardHeader>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <CardContent className="pt-6">

        <form
          id="role-form"

          onSubmit={(event) => {

            event.preventDefault()
            event.stopPropagation()

            void form.handleSubmit()

          }}

          noValidate
        >

          {/* =================================================
              ROLE NAME
          ================================================= */}

          <FieldGroup>

            <form.Field
              name="role_name"

              children={(field) => {

                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (

                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >

                    <FieldLabel
                      htmlFor={
                        field.name
                      }
                    >

                      Role Name

                      <span className="text-destructive">
                        {" "}*
                      </span>

                    </FieldLabel>


                    <Input
                      id={
                        field.name
                      }

                      name={
                        field.name
                      }

                      value={
                        field.state.value
                      }

                      onBlur={
                        field.handleBlur
                      }

                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }

                      aria-invalid={
                        isInvalid
                      }

                      placeholder="e.g. Temple Manager"

                      autoComplete="off"

                      disabled={
                        loading
                      }
                    />


                    <FieldDescription>

                      Enter the name of the role.

                    </FieldDescription>


                    {isInvalid && (

                      <FieldError
                        errors={
                          field.state.meta.errors
                        }
                      />

                    )}

                  </Field>

                )
              }}
            />

          </FieldGroup>


          {/* =================================================
              SUBMODULES
          ================================================= */}

          <form.Field
            name="submodule_ids"

            children={(field) => (

              <SubmoduleMultiSelect
                subModules={
                  subModules
                }

                value={
                  field.state.value ?? []
                }

                onChange={
                  field.handleChange
                }

                disabled={
                  loading
                }
              />

            )}
          />


          {/* =================================================
              PERMISSIONS
          ================================================= */}

          <form.Field
            name="permissions"

            children={(field) => {

              const permissions =
                field.state.value


              const permission =
                getPermission(
                  permissions,
                  ROLE_ID,
                )


              const add =
                hasPermission(
                  permission,
                  "add",
                )

              const edit =
                hasPermission(
                  permission,
                  "edit",
                )

              const deletePermission =
                hasPermission(
                  permission,
                  "delete",
                )


              const updatePermission = (
                type: PermissionType,
              ) => {

                if (
                  type === "view"
                ) {
                  return
                }

                const nextPermission =
                  calculatePermission(
                    permission,
                    type,
                  )


                const exists =
                  permissions.some(
                    (item) =>
                      item.role_id ===
                      ROLE_ID,
                  )


                let nextPermissions:
                  RolePermission[]


                if (exists) {

                  nextPermissions =
                    permissions.map(
                      (item) =>
                        item.role_id ===
                        ROLE_ID
                          ? {
                              ...item,
                              permission:
                                nextPermission,
                            }
                          : item,
                    )

                } else {

                  nextPermissions = [
                    ...permissions,
                    {
                      role_id:
                        ROLE_ID,
                      permission:
                        nextPermission,
                    },
                  ]

                }


                field.handleChange(
                  nextPermissions,
                )
              }


              return (

                <Card className="mt-8">

                  <CardHeader>

                    <CardTitle className="text-lg">

                      Permissions

                    </CardTitle>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">

                      Configure permissions for
                      this role.

                    </p>

                  </CardHeader>


                  <CardContent>

                    <div className="
                      overflow-x-auto
                      rounded-lg
                      border
                    ">

                      <table className="
                        w-full
                        min-w-[760px]
                      ">

                        <thead>

                          <tr className="
                            border-b
                            bg-muted/50
                          ">

                            <th className="
                              px-4
                              py-3
                              text-left
                              text-sm
                              font-semibold
                            ">

                              Role

                            </th>

                            <th className="
                              px-4
                              py-3
                              text-center
                              text-sm
                              font-semibold
                            ">

                              View

                            </th>

                            <th className="
                              px-4
                              py-3
                              text-center
                              text-sm
                              font-semibold
                            ">

                              Add

                            </th>

                            <th className="
                              px-4
                              py-3
                              text-center
                              text-sm
                              font-semibold
                            ">

                              Edit

                            </th>

                            <th className="
                              px-4
                              py-3
                              text-center
                              text-sm
                              font-semibold
                            ">

                              Delete

                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          <tr className="
                            border-b
                            last:border-0
                            hover:bg-muted/20
                          ">

                            <td className="
                              px-4
                              py-4
                            ">

                              <span className="font-medium">

                                {
                                  currentRoleName
                                }

                              </span>

                            </td>


                            <td className="
                              px-4
                              py-4
                              text-center
                            ">

                              <PermissionCheckbox
                                checked={
                                  true
                                }

                                disabled={
                                  true
                                }

                                onChange={() =>
                                  undefined
                                }

                                label={
                                  `View permission for ${currentRoleName}`
                                }
                              />

                            </td>


                            <td className="
                              px-4
                              py-4
                              text-center
                            ">

                              <PermissionCheckbox
                                checked={
                                  add
                                }

                                disabled={
                                  loading
                                }

                                onChange={() =>
                                  updatePermission(
                                    "add",
                                  )
                                }

                                label={
                                  `Add permission for ${currentRoleName}`
                                }
                              />

                            </td>


                            <td className="
                              px-4
                              py-4
                              text-center
                            ">

                              <PermissionCheckbox
                                checked={
                                  edit
                                }

                                disabled={
                                  loading
                                }

                                onChange={() =>
                                  updatePermission(
                                    "edit",
                                  )
                                }

                                label={
                                  `Edit permission for ${currentRoleName}`
                                }
                              />

                            </td>


                            <td className="
                              px-4
                              py-4
                              text-center
                            ">

                              <PermissionCheckbox
                                checked={
                                  deletePermission
                                }

                                disabled={
                                  loading
                                }

                                onChange={() =>
                                  updatePermission(
                                    "delete",
                                  )
                                }

                                label={
                                  `Delete permission for ${currentRoleName}`
                                }
                              />

                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </div>

                  </CardContent>

                </Card>

              )
            }}
          />

        </form>

      </CardContent>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <CardFooter className="
        flex
        justify-end
        gap-3
        border-t
        pt-6
      ">

        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={
            loading
          }
          onClick={() => {

            if (onCancel) {

              onCancel()

              return
            }

            form.reset()

          }}
        >

          Cancel

        </Button>


        <Button
          type="submit"
          form="role-form"
          className="cursor-pointer"
          disabled={
            loading
          }
        >

          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Role"
              : "Create Role"}

        </Button>

      </CardFooter>

    </Card>

  )
}


/* =========================================================
   SUBMODULE MULTI SELECT PROPS
========================================================= */

interface SubmoduleMultiSelectProps {
  subModules: SubModule[]
  value: number[]
  onChange: (value: number[]) => void
  disabled?: boolean
}


/* =========================================================
   SUBMODULE MULTI SELECT
========================================================= */

function SubmoduleMultiSelect({
  subModules,
  value,
  onChange,
  disabled = false,
}: SubmoduleMultiSelectProps) {

  /* =======================================================
     HOOKS ARE HERE AT TOP LEVEL
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("")


  const [
    open,
    setOpen,
  ] = useState(false)


  /* =======================================================
     SELECTED
  ======================================================= */

  const selectedIds =
    value ?? []


  /* =======================================================
     ALL SELECTED
  ======================================================= */

  const allSelected =
    subModules.length > 0 &&
    selectedIds.length ===
      subModules.length


  /* =======================================================
     SELECTED SUBMODULES
  ======================================================= */

  const selectedSubModules =
    subModules.filter(
      (item) =>
        selectedIds.includes(
          item.id,
        ),
    )


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSubModules =
    subModules.filter(
      (item) => {

        const searchText =
          search
            .trim()
            .toLowerCase()

        if (!searchText) {
          return true
        }

        return (
          item.sub_module_name
            .toLowerCase()
            .includes(
              searchText,
            ) ||
          item.sub_module_code
            ?.toLowerCase()
            .includes(
              searchText,
            )
        )
      },
    )


  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggleSubModule = (
    id: number,
  ) => {

    if (
      selectedIds.includes(id)
    ) {

      onChange(
        selectedIds.filter(
          (item) =>
            item !== id,
        ),
      )

      return
    }

    onChange([
      ...selectedIds,
      id,
    ])
  }


  /* =======================================================
     SELECT ALL
  ======================================================= */

  const toggleSelectAll = () => {

    if (allSelected) {

      onChange([])

      return
    }

    onChange(
      subModules.map(
        (item) =>
          item.id,
      ),
    )
  }


  /* =======================================================
     RETURN
  ======================================================= */

  return (

    <Field className="mt-6">

      <FieldLabel>

        Submodules

        <span className="text-destructive">
          {" "}*
        </span>

      </FieldLabel>


      <Popover
        open={open}
        onOpenChange={(nextOpen) => {

          setOpen(nextOpen)

          if (!nextOpen) {
            setSearch("")
          }

        }}
      >

        <PopoverTrigger>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="
              min-h-10
              w-full
              justify-between
              font-normal
            "
          >

            <div className="
              flex
              min-w-0
              flex-1
              flex-wrap
              items-center
              gap-1
              text-left
            ">

              {selectedSubModules.length === 0 ? (

                <span className="
                  text-muted-foreground
                ">

                  Select submodules...

                </span>

              ) : (

                <>

                  {selectedSubModules
                    .slice(0, 3)
                    .map(
                      (
                        subModule,
                      ) => (

                        <Badge
                          key={
                            subModule.id
                          }
                          variant="secondary"
                          className="font-normal"
                        >

                          {
                            subModule.sub_module_name
                          }

                        </Badge>

                      ),
                    )}


                  {selectedSubModules.length >
                    3 && (

                    <Badge
                      variant="outline"
                      className="font-normal"
                    >

                      +
                      {
                        selectedSubModules.length -
                        3
                      }{" "}
                      more

                    </Badge>

                  )}

                </>

              )}

            </div>


            <ChevronsUpDown
              className="
                ml-2
                h-4
                w-4
                shrink-0
                opacity-50
              "
            />

          </Button>

        </PopoverTrigger>


        <PopoverContent
          align="start"
          className="
            w-[--radix-popover-trigger-width]
            p-0
          "
        >

          <div className="w-full">

            {/* =============================================
                SEARCH
            ============================================= */}

            <div className="border-b p-2">

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search submodules..."
                className="h-9"
                autoFocus
              />

            </div>


            {/* =============================================
                SELECT ALL
            ============================================= */}

            <div className="border-b p-2">

              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                className="
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  rounded-md
                  px-2
                  py-2
                  text-left
                  text-sm
                  hover:bg-muted
                "
              >

                <span
                  className={`
                    mr-2
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-sm
                    border
                    ${
                      allSelected
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  `}
                >

                  {allSelected && (

                    <Check
                      className="
                        h-3
                        w-3
                      "
                    />

                  )}

                </span>


                <span className="font-medium">

                  {allSelected
                    ? "Unselect All"
                    : "Select All"}

                </span>

              </button>

            </div>


            {/* =============================================
                LIST
            ============================================= */}

            <div className="
              max-h-64
              overflow-y-auto
              p-2
            ">

              {filteredSubModules.length ===
              0 ? (

                <div className="
                  px-2
                  py-6
                  text-center
                  text-sm
                  text-muted-foreground
                ">

                  No submodules found.

                </div>

              ) : (

                <div className="space-y-1">

                  {filteredSubModules.map(
                    (
                      subModule,
                    ) => {

                      const selected =
                        selectedIds.includes(
                          subModule.id,
                        )

                      return (

                        <button
                          key={
                            subModule.id
                          }

                          type="button"

                          onClick={() =>
                            toggleSubModule(
                              subModule.id,
                            )
                          }

                          className="
                            flex
                            w-full
                            cursor-pointer
                            items-center
                            rounded-md
                            px-2
                            py-2
                            text-left
                            text-sm
                            hover:bg-muted
                          "
                        >

                          <span
                            className={`
                              mr-2
                              flex
                              h-4
                              w-4
                              shrink-0
                              items-center
                              justify-center
                              rounded-sm
                              border
                              ${
                                selected
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              }
                            `}
                          >

                            {selected && (

                              <Check
                                className="
                                  h-3
                                  w-3
                                "
                              />

                            )}

                          </span>


                          <span className="flex-1">

                            {
                              subModule.sub_module_name
                            }

                            {subModule.sub_module_code && (

                              <span className="
                                ml-2
                                text-xs
                                text-muted-foreground
                              ">

                                (
                                {
                                  subModule.sub_module_code
                                }
                                )

                              </span>

                            )}

                          </span>

                        </button>

                      )
                    },
                  )}

                </div>

              )}

            </div>


            {/* =============================================
                COUNT
            ============================================= */}

            <div className="
              border-t
              px-3
              py-2
              text-xs
              text-muted-foreground
            ">

              {selectedIds.length} of{" "}
              {subModules.length} selected

            </div>

          </div>

        </PopoverContent>

      </Popover>


      <FieldDescription>

        Select one or more submodules
        for this role.

      </FieldDescription>

    </Field>

  )
}


/* =========================================================
   PERMISSION CHECKBOX
========================================================= */

interface PermissionCheckboxProps {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}


function PermissionCheckbox({
  checked,
  disabled = false,
  onChange,
  label,
}: PermissionCheckboxProps) {

  return (

    <div className="flex justify-center">

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        className="
          h-4
          w-4
          cursor-pointer
          rounded
          border-input
          accent-primary
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      />

    </div>

  )
}