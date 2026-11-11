
"use client"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"


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
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { Package, Settings2 } from "lucide-react"
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

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Name and type", icon: Package },
  { id: 2, label: "Settings", subLabel: "Order and status", icon: Settings2 },
]

export default function ModulesForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: ModulesFormProps) {
  const isEditMode = Boolean(initialData)

  const form = useForm({
    defaultValues: {
      // module_code: initialData?.module_code ?? "",
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
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode
            ? "Edit Module"
            : "Create Module"}
      submitButton={
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
      }
    >
      <form
        id="module-form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()

          void form.handleSubmit()
        }}
        noValidate
      >
        <FormStep step={1}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <SelectTrigger className="capitalize"
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
                                  | "temples"
                              )

                              field.handleBlur()
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="capitalize"
                              aria-invalid={isInvalid}
                            >
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="users">
                                Users
                              </SelectItem>

                              <SelectItem value="temples">
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
          </FieldGroup>
        </FormStep>

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <SelectTrigger className="capitalize"
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
        </FormStep>
      </form>
    </FormWizard>
  )
}
