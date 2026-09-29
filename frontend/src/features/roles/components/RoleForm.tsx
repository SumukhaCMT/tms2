
"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useForm,
} from "@tanstack/react-form"

import {
  Check,
  ChevronsUpDown,
} from "lucide-react"

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
  Badge,
} from "@/components/ui/badge"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


/* =========================================================
   TYPES
========================================================= */

export type RolePermission = {
  sub_module_id: number
  permission: number
}

export type SubModule = {
  id: number
  sub_module_name: string
  sub_module_code?: string
}

export type RoleFormData = {
  role_name: string
  submodule_ids: number[]
  permissions: RolePermission[]
}

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
   PERMISSION TYPES
========================================================= */

type PermissionType =
  | "view"
  | "add"
  | "edit"
  | "delete"


/* =========================================================
   PERMISSION BIT VALUES

   0 = View
   1 = Delete
   2 = Edit
   4 = Add

   0 = View
   1 = Delete
   2 = Edit
   3 = Edit + Delete
   4 = Add
   5 = Add + Delete
   6 = Add + Edit
   7 = Add + Edit + Delete
========================================================= */

const PERMISSION = {
  ADD: 4,
  EDIT: 2,
  DELETE: 1,
} as const


/* =========================================================
   GET PERMISSION
========================================================= */

function getPermission(
  permissions: RolePermission[],
  subModuleId: number,
): number {
  return (
    permissions.find(
      (item) =>
        item.sub_module_id ===
        subModuleId,
    )?.permission ?? 0
  )
}


/* =========================================================
   CHECK PERMISSION
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
   PERMISSION CHECKBOX
========================================================= */

interface PermissionCheckboxProps {
  checked: boolean
  disabled?: boolean
  onChange?: () => void
}

function PermissionCheckbox({
  checked,
  disabled,
  onChange,
}: PermissionCheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`
        flex h-8 w-8
        items-center
        justify-center
        rounded-md
        border
        transition-colors

        ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background hover:bg-accent"
        }

        ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        }
      `}
    >
      {checked && (
        <Check className="h-4 w-4" />
      )}
    </button>
  )
}


/* =========================================================
   SUBMODULE MULTI SELECT
========================================================= */

interface SubmoduleMultiSelectProps {
  subModules: SubModule[]
  value: number[]
  onChange: (
    value: number[],
  ) => void
  disabled?: boolean
}

function SubmoduleMultiSelect({
  subModules,
  value,
  onChange,
  disabled,
}: SubmoduleMultiSelectProps) {
  const [open, setOpen] =
    useState(false)

  const selectedIds =
    value ?? []

  const allSelected =
    subModules.length > 0 &&
    selectedIds.length ===
      subModules.length

  const selectedSubModules =
    subModules.filter(
      (item) =>
        selectedIds.includes(
          item.id,
        ),
    )


  /* =======================================================
     TOGGLE SUBMODULE
  ======================================================= */

  const toggleSubModule = (
    id: number,
  ) => {
    if (
      selectedIds.includes(id)
    ) {
      onChange(
        selectedIds.filter(
          (item) => item !== id,
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
     TOGGLE ALL
  ======================================================= */

  const toggleAll = () => {
    if (allSelected) {
      onChange([])
      return
    }

    onChange(
      subModules.map(
        (item) => item.id,
      ),
    )
  }


  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >

      {/* ===================================================
          POPOVER TRIGGER

          IMPORTANT:
          Base UI PopoverTrigger itself renders the
          trigger element. Do not put another Button
          inside it.
      =================================================== */}

      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-10 w-full justify-between"
          />
        }
      >

        <div className="flex min-w-0 flex-1 items-center gap-2">

          {selectedSubModules.length ===
          0 ? (

            <span className="text-muted-foreground">
              Select submodules
            </span>

          ) : (

            <div className="flex flex-wrap gap-1">

              {selectedSubModules
                .slice(0, 3)
                .map(
                  (subModule) => (
                    <Badge
                      key={
                        subModule.id
                      }
                      variant="secondary"
                      className="max-w-45 truncate"
                    >
                      {
                        subModule.sub_module_name
                      }
                    </Badge>
                  ),
                )}

              {selectedSubModules.length >
                3 && (
                <Badge variant="secondary">
                  +
                  {selectedSubModules.length -
                    3}
                </Badge>
              )}

            </div>

          )}

        </div>

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

      </PopoverTrigger>


      {/* ===================================================
          POPOVER CONTENT
      =================================================== */}

      <PopoverContent
        className="w-[var(--anchor-width)] p-2"
        align="start"
      >

        <div className="max-h-80 overflow-y-auto">

          {/* =================================================
              SELECT ALL
          ================================================= */}

          <button
            type="button"
            disabled={disabled}
            onClick={toggleAll}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
          >

            <span
              className={`
                flex h-4 w-4
                items-center
                justify-center
                rounded-sm
                border

                ${
                  allSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input"
                }
              `}
            >
              {allSelected && (
                <Check className="h-3 w-3" />
              )}
            </span>

            <span className="font-medium">
              Select All
            </span>

          </button>


          <div className="my-2 border-t" />


          {/* =================================================
              SUBMODULE LIST
          ================================================= */}

          {subModules.length ===
          0 ? (

            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No submodules available
            </div>

          ) : (

            subModules.map(
              (subModule) => {

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
                    disabled={disabled}
                    onClick={() =>
                      toggleSubModule(
                        subModule.id,
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >

                    <span
                      className={`
                        flex h-4 w-4
                        shrink-0
                        items-center
                        justify-center
                        rounded-sm
                        border

                        ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }
                      `}
                    >
                      {selected && (
                        <Check className="h-3 w-3" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">

                      <div className="truncate">
                        {
                          subModule.sub_module_name
                        }
                      </div>

                      {subModule.sub_module_code && (
                        <div className="truncate text-xs text-muted-foreground">
                          {
                            subModule.sub_module_code
                          }
                        </div>
                      )}

                    </div>

                  </button>
                )
              },
            )

          )}

        </div>

      </PopoverContent>

    </Popover>
  )
}


/* =========================================================
   MAIN ROLE FORM
========================================================= */

export default function RoleForm({
  initialData,
  subModules,
  loading = false,
  onSubmit,
  onCancel,
}: RoleFormProps) {

  /* =======================================================
     FORM
  ======================================================= */

  const form = useForm({
    defaultValues: {
      role_name:
        initialData?.role_name ??
        "",

      submodule_ids:
        initialData?.submodule_ids ??
        [],

      permissions:
        initialData?.permissions ??
        [],
    } satisfies RoleFormData,

    onSubmit: async ({
      value,
    }) => {

      const roleName =
        value.role_name.trim()

      if (!roleName) {
        return
      }

      /* ===================================================
         KEEP ONLY SELECTED SUBMODULE PERMISSIONS
      =================================================== */

      const selectedIds =
        new Set(
          value.submodule_ids,
        )

      const permissions =
        value.permissions.filter(
          (item) =>
            selectedIds.has(
              item.sub_module_id,
            ),
        )

      await onSubmit({
        role_name:
          roleName,

        submodule_ids:
          value.submodule_ids,

        permissions,
      })
    },
  })


  /* =======================================================
     SYNC INITIAL DATA
  ======================================================= */

  useEffect(() => {
    if (!initialData) {
      return
    }

    form.setFieldValue(
      "role_name",
      initialData.role_name ?? "",
    )

    form.setFieldValue(
      "submodule_ids",
      initialData.submodule_ids ?? [],
    )

    form.setFieldValue(
      "permissions",
      initialData.permissions ?? [],
    )
  }, [initialData, form])


  return (
    <Card className="w-full">

      {/* ===================================================
          HEADER
      =================================================== */}

      <CardHeader>
        <CardTitle>
          {initialData?.id
            ? "Edit Role"
            : "Create Role"}
        </CardTitle>
      </CardHeader>


      <CardContent>

        <FieldGroup>

          {/* =================================================
              ROLE NAME
          ================================================= */}

          <form.Field
            name="role_name"
            children={(field) => {

              const hasError =
                field.state.meta
                  .errors.length > 0

              return (
                <Field
                  data-invalid={
                    hasError
                  }
                >

                  <FieldLabel htmlFor="role_name">
                    Role Name
                  </FieldLabel>

                  <Input
                    id="role_name"
                    name="role_name"
                    value={
                      field.state.value
                    }
                    onChange={(
                      event,
                    ) =>
                      field.handleChange(
                        event.target.value,
                      )
                    }
                    placeholder="Enter role name"
                    disabled={loading}
                    autoComplete="off"
                  />

                  <FieldDescription>
                    Enter the name of the role.
                  </FieldDescription>

                  {hasError && (
                    <FieldError
                      errors={
                        field.state.meta
                          .errors
                      }
                    />
                  )}

                </Field>
              )
            }}
          />


          {/* =================================================
              SUBMODULES + PERMISSIONS
          ================================================= */}

          <form.Field
            name="submodule_ids"
            children={(submoduleField) => {

              const selectedIds =
                submoduleField.state
                  .value ?? []

              /*
               * Calculate selected submodules
               * FROM THE CURRENT FIELD STATE.
               *
               * This makes the permission table
               * update immediately.
               */

              const selectedSubModules =
                subModules.filter(
                  (subModule) =>
                    selectedIds.includes(
                      subModule.id,
                    ),
                )

              return (
                <div className="space-y-6">

                  {/* =========================================
                      SUBMODULE SELECT
                  ========================================= */}

                  <Field>

                    <FieldLabel>
                      Submodules
                    </FieldLabel>

                    <SubmoduleMultiSelect
                      subModules={
                        subModules
                      }
                      value={
                        selectedIds
                      }
                      onChange={
                        submoduleField.handleChange
                      }
                      disabled={
                        loading
                      }
                    />

                    <FieldDescription>
                      Select the submodules
                      this role can access.
                    </FieldDescription>

                  </Field>


                  {/* =========================================
                      PERMISSIONS

                      Nested field is safe here because
                      permissions are independent from
                      submodule_ids.
                  ========================================= */}

                  <form.Field
                    name="permissions"
                    children={(
                      permissionField,
                    ) => {

                      const permissions =
                        permissionField
                          .state.value ?? []


                      /* =====================================
                         UPDATE PERMISSION
                      ===================================== */

                      const updatePermission = (
                        subModuleId: number,
                        type: PermissionType,
                      ) => {

                        if (
                          type ===
                          "view"
                        ) {
                          return
                        }

                        const currentPermission =
                          getPermission(
                            permissions,
                            subModuleId,
                          )

                        const nextPermission =
                          calculatePermission(
                            currentPermission,
                            type,
                          )

                        const exists =
                          permissions.some(
                            (item) =>
                              item.sub_module_id ===
                              subModuleId,
                          )


                        let nextPermissions:
                          RolePermission[]


                        if (exists) {

                          nextPermissions =
                            permissions.map(
                              (item) =>
                                item.sub_module_id ===
                                subModuleId
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
                              sub_module_id:
                                subModuleId,
                              permission:
                                nextPermission,
                            },
                          ]

                        }

                        permissionField.handleChange(
                          nextPermissions,
                        )
                      }


                      return (
                        <Field>

                          <FieldLabel>
                            Permissions
                          </FieldLabel>

                          <FieldDescription>
                            Configure permissions
                            for each selected
                            submodule.
                          </FieldDescription>


                          {/* =================================
                              NO SUBMODULE
                          ================================= */}

                          {selectedSubModules.length ===
                          0 ? (

                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                              Select at least one
                              submodule to configure
                              permissions.
                            </div>

                          ) : (

                            /* ===============================
                               PERMISSION TABLE
                            =============================== */

                            <div className="overflow-x-auto rounded-lg border">

                              <table className="w-full text-sm">

                                <thead>

                                  <tr className="border-b bg-muted/50">

                                    <th className="px-4 py-3 text-left font-medium">
                                      Submodule
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                      View
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                      Add
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                      Edit
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                      Delete
                                    </th>

                                  </tr>

                                </thead>


                                <tbody>

                                  {selectedSubModules.map(
                                    (
                                      subModule,
                                    ) => {

                                      const permission =
                                        getPermission(
                                          permissions,
                                          subModule.id,
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


                                      return (
                                        <tr
                                          key={
                                            subModule.id
                                          }
                                          className="border-b last:border-b-0"
                                        >

                                          {/* =================
                                              SUBMODULE
                                          ================= */}

                                          <td className="px-4 py-3">

                                            <div className="font-medium">
                                              {
                                                subModule.sub_module_name
                                              }
                                            </div>

                                            {subModule.sub_module_code && (
                                              <div className="text-xs text-muted-foreground">
                                                {
                                                  subModule.sub_module_code
                                                }
                                              </div>
                                            )}

                                          </td>


                                          {/* =================
                                              VIEW
                                          ================= */}

                                          <td className="px-4 py-3 text-center">

                                            <div className="flex justify-center">

                                              <PermissionCheckbox
                                                checked={
                                                  true
                                                }
                                                disabled={
                                                  true
                                                }
                                              />

                                            </div>

                                          </td>


                                          {/* =================
                                              ADD
                                          ================= */}

                                          <td className="px-4 py-3 text-center">

                                            <div className="flex justify-center">

                                              <PermissionCheckbox
                                                checked={
                                                  add
                                                }
                                                disabled={
                                                  loading
                                                }
                                                onChange={() =>
                                                  updatePermission(
                                                    subModule.id,
                                                    "add",
                                                  )
                                                }
                                              />

                                            </div>

                                          </td>


                                          {/* =================
                                              EDIT
                                          ================= */}

                                          <td className="px-4 py-3 text-center">

                                            <div className="flex justify-center">

                                              <PermissionCheckbox
                                                checked={
                                                  edit
                                                }
                                                disabled={
                                                  loading
                                                }
                                                onChange={() =>
                                                  updatePermission(
                                                    subModule.id,
                                                    "edit",
                                                  )
                                                }
                                              />

                                            </div>

                                          </td>


                                          {/* =================
                                              DELETE
                                          ================= */}

                                          <td className="px-4 py-3 text-center">

                                            <div className="flex justify-center">

                                              <PermissionCheckbox
                                                checked={
                                                  deletePermission
                                                }
                                                disabled={
                                                  loading
                                                }
                                                onChange={() =>
                                                  updatePermission(
                                                    subModule.id,
                                                    "delete",
                                                  )
                                                }
                                              />

                                            </div>

                                          </td>

                                        </tr>
                                      )
                                    },
                                  )}

                                </tbody>

                              </table>

                            </div>

                          )}

                        </Field>
                      )
                    }}
                  />

                </div>
              )
            }}
          />

        </FieldGroup>

      </CardContent>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <CardFooter className="flex justify-end gap-3">

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}

        <Button
          type="button"
          disabled={loading}
          onClick={() =>
            form.handleSubmit()
          }
        >
          {loading
            ? "Saving..."
            : initialData?.id
              ? "Update Role"
              : "Create Role"}
        </Button>

      </CardFooter>

    </Card>
  )
}

