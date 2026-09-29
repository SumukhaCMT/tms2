
"use client"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"

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

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  moduleSchema,
  
} from "../moduleValidation"
import type { ModuleFormData } from "../moduleValidation"
/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ModulesFormProps {
  initialData?: Partial<ModuleFormData>
  loading?: boolean
  onSubmit: (data: ModuleFormData) => Promise<void> | void
  onCancel?: () => void
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ModulesForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: ModulesFormProps) {
  const isEditMode = Boolean(initialData)

  const form = useForm({
    defaultValues: {
      module_code: initialData?.module_code ?? "",
      module_name: initialData?.module_name ?? "",

      module_type:
        initialData?.module_type ?? "feature",

      capacity_type:
        initialData?.capacity_type ?? null,

      consumable_type:
        initialData?.consumable_type ?? null,

      display_order:
        initialData?.display_order ?? 1,

      status:
        initialData?.status ?? "active",
    } satisfies ModuleFormData,

    validators: {
      onSubmit: moduleSchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <Card className="w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <CardHeader>
        <CardTitle>
          {isEditMode
            ? "Edit Module"
            : "Create Module"}
        </CardTitle>
      </CardHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <CardContent>
        <form
          id="module-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()

            void form.handleSubmit()
          }}
          noValidate
        >
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* ========================================================== */}
            {/* MODULE CODE                                                 */}
            {/* ========================================================== */}

            <form.Field
              name="module_code"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Module Code
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="e.g. DONATION"
                      autoComplete="off"
                      disabled={loading}
                    />

                    <FieldDescription>
                      Example: DONATION, SEVA, USERS.
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================== */}
            {/* MODULE NAME                                                 */}
            {/* ========================================================== */}

            <form.Field
              name="module_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Module Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="e.g. Donation Management"
                      autoComplete="off"
                      disabled={loading}
                    />

                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================== */}
            {/* MODULE TYPE                                                 */}
            {/* ========================================================== */}

            <form.Field
              name="module_type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Module Type
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        const moduleType =
                          value as ModuleFormData["module_type"]

                        field.handleChange(
                          moduleType
                        )

                        field.handleBlur()

                        if (
                          moduleType === "feature"
                        ) {
                          form.setFieldValue(
                            "capacity_type",
                            null
                          )

                          form.setFieldValue(
                            "consumable_type",
                            null
                          )
                        }

                        if (
                          moduleType === "capacity"
                        ) {
                          form.setFieldValue(
                            "capacity_type",
                            null
                          )

                          form.setFieldValue(
                            "consumable_type",
                            null
                          )
                        }

                        if (
                          moduleType === "consumable"
                        ) {
                          form.setFieldValue(
                            "capacity_type",
                            null
                          )

                          form.setFieldValue(
                            "consumable_type",
                            null
                          )
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select module type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="feature">
                          Feature
                        </SelectItem>

                        <SelectItem value="capacity">
                          Capacity
                        </SelectItem>

                        <SelectItem value="consumable">
                          Consumable
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select the type of module.
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================== */}
            {/* CAPACITY TYPE                                               */}
            {/* ========================================================== */}

            <form.Subscribe
              selector={(state) =>
                state.values.module_type
              }
            >
              {(moduleType) =>
                moduleType === "capacity" ? (
                  <form.Field
                    name="capacity_type"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !field.state.meta.isValid

                      return (
                        <Field
                          data-invalid={isInvalid}
                        >
                          <FieldLabel>
                            Capacity Type
                            <span className="text-destructive">
                              *
                            </span>
                          </FieldLabel>

                          <Select
                            value={
                              field.state.value ?? ""
                            }
                            onValueChange={(value) => {
                              field.handleChange(
                                value as
                                  | "users"
                                  | "temple"
                              )

                              field.handleBlur()
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger
                              aria-invalid={isInvalid}
                            >
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="users">
                                Users
                              </SelectItem>

                              <SelectItem value="temple">
                                Temple
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <FieldDescription>
                            Defines what the module
                            capacity applies to.
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
                ) : null
              }
            </form.Subscribe>

            {/* ========================================================== */}
            {/* CONSUMABLE TYPE                                             */}
            {/* ========================================================== */}

            <form.Subscribe
              selector={(state) =>
                state.values.module_type
              }
            >
              {(moduleType) =>
                moduleType === "consumable" ? (
                  <form.Field
                    name="consumable_type"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !field.state.meta.isValid

                      return (
                        <Field
                          data-invalid={isInvalid}
                        >
                          <FieldLabel>
                            Consumable Type
                            <span className="text-destructive">
                              *
                            </span>
                          </FieldLabel>

                          <Select
                            value={
                              field.state.value ?? ""
                            }
                            onValueChange={(value) => {
                              field.handleChange(
                                value as
                                  | "sms"
                                  | "email"
                                  | "whatsapp"
                              )

                              field.handleBlur()
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger
                              aria-invalid={isInvalid}
                            >
                              <SelectValue placeholder="Select consumable" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="sms">
                                SMS
                              </SelectItem>

                              <SelectItem value="email">
                                Email
                              </SelectItem>

                              <SelectItem value="whatsapp">
                                WhatsApp
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <FieldDescription>
                            Defines how the module
                            is consumed.
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
                ) : null
              }
            </form.Subscribe>

            {/* ========================================================== */}
            {/* DISPLAY ORDER                                               */}
            {/* ========================================================== */}

            <form.Field
              name="display_order"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display Order
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const value =
                          event.target.value

                        field.handleChange(
                          value === ""
                            ? 0
                            : Number(value)
                        )
                      }}
                      aria-invalid={isInvalid}
                      disabled={loading}
                    />

                    <FieldDescription>
                      Controls module display order.
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================== */}
            {/* STATUS                                                      */}
            {/* ========================================================== */}

            <form.Field
              name="status"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Status
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(
                          value as ModuleFormData["status"]
                        )

                        field.handleBlur()
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">
                          Active
                        </SelectItem>

                        <SelectItem value="inactive">
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

          </FieldGroup>
        </form>
      </CardContent>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}

      <CardFooter className="flex justify-end">
        <Field orientation="horizontal">
          <Button
           className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) {
                onCancel()
              } else {
                form.reset()
              }
            }}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
           className="cursor-pointer"
            type="submit"
            form="module-form"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Module"
                : "Create Module"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
