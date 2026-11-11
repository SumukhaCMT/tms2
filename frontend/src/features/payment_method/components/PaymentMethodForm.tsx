
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Temple } from "../../temple/templeTypes"

import {
  paymentMethodSchema,
  type PaymentMethodFormData,
} from "../paymentMethodValidation"
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { Settings2, Wallet } from "lucide-react"

interface PaymentMethodFormProps {
  initialData?: Partial<PaymentMethodFormData>
  loading?: boolean
  temples: Temple[]
  templesLoading?: boolean
  onSubmit: (data: PaymentMethodFormData) => Promise<void> | void
  onCancel?: () => void
}

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Temple and method", icon: Wallet },
  { id: 2, label: "Settings", subLabel: "Order and status", icon: Settings2 },
]

export default function PaymentMethodForm({
  initialData,
  loading = false,
  temples,
  templesLoading = false,
  onSubmit,
  onCancel,
}: PaymentMethodFormProps) {
  const isEditMode = Boolean(initialData)

  const form = useForm({
    defaultValues: {
      temple_id: initialData?.temple_id ?? 0,
      payment_method: initialData?.payment_method ?? "",
      payment_method_type:
        initialData?.payment_method_type ?? "offline",
      remark: initialData?.remark ?? "",
      is_default: initialData?.is_default ?? "no",
      display_order: initialData?.display_order ?? 0,
      status: initialData?.status ?? "active",
    } satisfies PaymentMethodFormData,

    validators: {
      onSubmit: paymentMethodSchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode
            ? "Edit Payment Method"
            : "Create Payment Method"}
      cancelButton={
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
      }
      submitButton={
        <Button
        className="cursor-pointer"
          type="submit"
          form="payment-method-form"
          disabled={loading || templesLoading}
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Payment Method"
              : "Create Payment Method"}
        </Button>
      }
    >
      <form
        id="payment-method-form"
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
              name="temple_id"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                const selectedTemple = temples.find(
                  (temple) => temple.id === Number(field.state.value)
                );

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Temple *
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value > 0
                          ? String(field.state.value)
                          : ""
                      }
                      onValueChange={(value) => {
                        field.handleChange(Number(value));
                        field.handleBlur();
                      }}
                      disabled={
                        loading ||
                        templesLoading ||
                        temples.length === 0
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full capitalize cursor-pointer"

                        aria-invalid={invalid}
                      >
                        <SelectValue
                          placeholder={
                            templesLoading
                              ? "Loading temples..."
                              : temples.length === 0
                                ? "No temples available"
                                : "Select a temple"
                          }
                        >
                          {selectedTemple?.temp_name}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {temples.map((temple) => (
                          <SelectItem
                            key={temple.id}
                            value={String(temple.id)}
                          >
                            {temple.temp_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select the temple this Payment Method belongs to.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="payment_method"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Payment Method *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      placeholder="e.g. UPI, Cash, Card"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="payment_method_type"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>
                      Payment Method Type *
                    </FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(
                          value as "online" | "offline",
                        )
                        field.handleBlur()
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className="w-full capitalize"
                        aria-invalid={invalid}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="online">
                          Online
                        </SelectItem>
                        <SelectItem value="offline">
                          Offline
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {invalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="remark"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field
                    className="md:col-span-2 lg:col-span-3"
                    data-invalid={invalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Remark
                    </FieldLabel>

                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      placeholder="Enter payment instructions or remarks"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    <FieldDescription>
                      Optional; maximum 500 characters.
                    </FieldDescription>

                    {invalid && (
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

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="is_default"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Default Payment Method *
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as "yes" | "no")
                      field.handleBlur()
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize  cursor-pointer">
                      <SelectValue placeholder="Select default" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <form.Field
              name="display_order"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display Order *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
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
              children={(field) => (
                <Field>
                  <FieldLabel>Status *</FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(
                        value as "active" | "inactive",
                      )
                      field.handleBlur()
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
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
                </Field>
              )}
            />
          </FieldGroup>
        </FormStep>
      </form>
    </FormWizard>
  )
}