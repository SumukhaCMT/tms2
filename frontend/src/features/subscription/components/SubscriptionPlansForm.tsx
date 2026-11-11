
import { useForm } from "@tanstack/react-form"
import { useSelector } from "react-redux"

import type { RootState } from "@/app/store"

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
  subscriptionPlanSchema,
  type SubscriptionPlanFormData,
} from "../subscriptionPlanValidation"

import type { SubscriptionPlan } from "../subscriptionPlanTypes"
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { IndianRupee, Layers } from "lucide-react"

interface SubscriptionPlansFormProps {
  initialData?: SubscriptionPlan
  loading?: boolean
  onSubmit: (data: SubscriptionPlanFormData) => Promise<void>
  onCancel: () => void
}

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Module, name and type", icon: Layers },
  { id: 2, label: "Pricing", subLabel: "Price, GST and AMC", icon: IndianRupee },
]

export default function SubscriptionPlansForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: SubscriptionPlansFormProps) {
  const modules = useSelector(
    (state: RootState) => state.modules.modules,
  )

  const form = useForm({
    defaultValues: {
      module_id: initialData?.module_id ?? 0,

      plan_name: initialData?.plan_name ?? "",

      plan_code: initialData?.plan_code ?? "",

      plan_type:
        initialData?.plan_type ?? "subscription",

      plan_quantity:
        initialData?.plan_quantity ?? null,

      plan_duration_months:
        initialData?.plan_duration_months ?? null,

      plan_price:
        initialData?.plan_price ?? 0,

      plan_gst_percentage:
        initialData?.plan_gst_percentage ?? 0,

      plan_total_price:
        initialData?.plan_total_price ?? 0,

      plan_amc_price:
        initialData?.plan_amc_price ?? null,

      plan_amc_duration_months:
        initialData?.plan_amc_duration_months ?? null,

      plan_amc_gst_percentage:
        initialData?.plan_amc_gst_percentage ?? 0,

      plan_amc_start_date:
        initialData?.plan_amc_start_date ?? null,

      plan_status:
        initialData?.plan_status ?? "active",
    },

    validators: {
      onSubmit: subscriptionPlanSchema,
    },

    onSubmit: async ({ value }) => {
      const submitData: SubscriptionPlanFormData =
        value.plan_type === "subscription"
          ? {
              ...value,
              plan_amc_price: null,
              plan_amc_duration_months: null,
              plan_amc_gst_percentage: 0,
              plan_amc_start_date: null,
            }
          : value

      await onSubmit(submitData)
    },
  })

  /*
   * ---------------------------------------------------------
   * CALCULATE TOTAL PRICE
   * ---------------------------------------------------------
   *
   * Total = Plan Price + GST
   *
   * Example:
   *
   * Price = 4999
   * GST   = 18%
   *
   * GST Amount = 4999 * 18 / 100
   *            = 899.82
   *
   * Total = 4999 + 899.82
   *       = 5898.82
   */
  const calculateTotalPrice = (
    price: number,
    gst: number,
  ) => {
    const validPrice = Number(price) || 0
    const validGst = Number(gst) || 0

    const total =
      validPrice +
      (validPrice * validGst) / 100

    return Number(total.toFixed(2))
  }

  const getErrorText = (
    errors: unknown[],
  ) =>
    errors
      .map((error) =>
        typeof error === "string"
          ? error
          : error &&
              typeof error === "object" &&
              "message" in error
            ? String(
                (error as { message?: unknown })
                  .message ?? "",
              )
            : "",
      )
      .filter(Boolean)
      .join(", ")

  /*
   * ---------------------------------------------------------
   * PLAN PRICE CHANGE
   * ---------------------------------------------------------
   */
  const handlePlanPriceChange = (
    value: string,
  ) => {
    const price =
      value === "" ? 0 : Number(value)

    form.setFieldValue(
      "plan_price",
      price,
    )

    const gst =
      Number(
        form.state.values.plan_gst_percentage,
      ) || 0

    const total = calculateTotalPrice(
      price,
      gst,
    )

    form.setFieldValue(
      "plan_total_price",
      total,
    )
  }

  /*
   * ---------------------------------------------------------
   * GST CHANGE
   * ---------------------------------------------------------
   */
  const handleGstChange = (
    value: string,
  ) => {
    const gst =
      value === "" ? 0 : Number(value)

    form.setFieldValue(
      "plan_gst_percentage",
      gst,
    )

    const price =
      Number(
        form.state.values.plan_price,
      ) || 0

    const total = calculateTotalPrice(
      price,
      gst,
    )

    form.setFieldValue(
      "plan_total_price",
      total,
    )
  }
  
  return (
    <FormWizard
      steps={FORM_STEPS}
      title={initialData ? "Edit Subscription Plan" : "Add Subscription Plan"}
      cancelButton={
        <Button
         className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      }
      submitButton={
        <Button
         className="cursor-pointer"
          type="submit"
          form="subscription-plan-form"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Plan"
              : "Create Plan"}
        </Button>
      }
    >
      <form
        id="subscription-plan-form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()

          void form.handleSubmit()
        }}
      >
        <FormStep step={1}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="module_id"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                const selectedModule = modules.find(
                  (module) =>
                    Number(module.id) === Number(field.state.value),
                );

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                       Module *
                    </FieldLabel>

                    <Select
                      value={
                        Number(field.state.value) > 0
                          ? String(field.state.value)
                          : ""
                      }
                      onValueChange={(value) => {
                        field.handleChange(Number(value));
                        field.handleBlur();
                      }}
                      // disabled={formLoading || modules.length === 0}
                    >
                      <SelectTrigger

                        id={field.name}
                        className="w-full capitalize cursor-pointer"
                        aria-invalid={invalid}
                      >
                        <SelectValue
                          placeholder={
                            modules.length === 0
                              ? "No modules available"
                              : "Select a parent module"
                          }
                        >
                          {selectedModule
                            ? selectedModule.module_name
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem
                            key={module.id}
                            value={String(module.id)}
                          >
                            {module.module_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select the parent module for this Plans.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="plan_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Plan Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Enter Plan Name"
                      disabled={loading}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="plan_code"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Plan Code
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.toUpperCase(),
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Enter Plan Code"
                      disabled={loading}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="plan_type"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Plan Type
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        const newType =
                          value as SubscriptionPlanFormData["plan_type"]

                        field.handleChange(
                          newType,
                        )

                        field.handleBlur()

                        /*
                         * When changing to subscription,
                         * clear AMC values.
                         */
                        if (
                          newType ===
                          "subscription"
                        ) {
                          form.setFieldValue(
                            "plan_amc_price",
                            null,
                          )

                          form.setFieldValue(
                            "plan_amc_duration_months",
                            null,
                          )

                          form.setFieldValue(
                            "plan_amc_gst_percentage",
                            0,
                          )

                          form.setFieldValue(
                            "plan_amc_start_date",
                            null,
                          )
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                     className="capitalize cursor-pointer"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select Plan Type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="subscription" className="capitalize cursor-pointer">
                          Subscription
                        </SelectItem>

                        <SelectItem value="perpetual" className="capitalize cursor-pointer">
                          Perpetual
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="plan_quantity"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Plan Quantity
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    value={
                      field.state.value ?? ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value

                      field.handleChange(
                        value === ""
                          ? null
                          : Number(value),
                      )
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Enter Quantity"
                    disabled={loading}
                  />

                  <FieldDescription>
                    Credits, users or temples
                    depending on the module.
                  </FieldDescription>

                  {field.state.meta.isTouched &&
                    !field.state.meta.isValid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                </Field>
              )}
            />

            <form.Field
              name="plan_status"
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
                          value as SubscriptionPlanFormData["plan_status"],
                        )

                        field.handleBlur()
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="capitalize cursor-pointer"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select Status" />
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
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </FormStep>

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Subscribe
              selector={(state) =>
                state.values.plan_type
              }
            >
              {(planType) =>
                planType === "subscription" ? (

            <>
            <form.Field
              name="plan_price"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Plan Price
                    <span className="text-destructive">
                      *
                    </span>
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={field.state.value}
                    onChange={(event) =>
                      handlePlanPriceChange(
                        event.target.value,
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder="Enter Plan Price"
                    disabled={loading}
                  />

                  {field.state.meta.isTouched &&
                    !field.state.meta.isValid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                </Field>
              )}
            />

            {/* ========================================================= */}
            {/* GST                                                         */}
            {/* Works for Subscription + Perpetual                         */}
            {/* ========================================================= */}

            <form.Field
              name="plan_gst_percentage"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    GST (%)
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={field.state.value}
                    onChange={(event) =>
                      handleGstChange(
                        event.target.value,
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder="Enter GST %"
                    disabled={loading}
                  />

                  {field.state.meta.isTouched &&
                    !field.state.meta.isValid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                </Field>
              )}
            />

            {/* ========================================================= */}
            {/* TOTAL PRICE                                                 */}
            {/* ========================================================= */}

            <form.Field
              name="plan_total_price"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Total Price
                    <span className="text-destructive">
                      *
                    </span>
                  </FieldLabel>

                  <Input
                    type="number"
                    value={field.state.value}
                    readOnly
                    disabled={loading}
                  />

                  <FieldDescription>
                    Automatically calculated from
                    Plan Price + GST.
                  </FieldDescription>

                  {field.state.meta.isTouched &&
                    !field.state.meta.isValid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                </Field>
              )}
            />
                  <form.Field
                    name="plan_duration_months"
                    children={(field) => (
                      <Field>
                        <FieldLabel>
                          Duration (Months)
                        </FieldLabel>

                        <Input
                          type="number"
                          min={1}
                          value={
                            field.state.value ??
                            ""
                          }
                          onChange={(event) => {
                            const value =
                              event.target.value

                            field.handleChange(
                              value === ""
                                ? null
                                : Number(value),
                            )
                          }}
                          onBlur={field.handleBlur}
                          placeholder="Enter Duration"
                          disabled={loading}
                        />

                        {field.state.meta
                          .isTouched &&
                          !field.state.meta
                            .isValid && (
                            <FieldError>
                              {getErrorText(
                                field.state.meta
                                  .errors,
                              )}
                            </FieldError>
                          )}
                      </Field>
                    )}
                  />
                  </>
                ) : null
              }
            </form.Subscribe>

            <form.Subscribe
              selector={(state) =>
                state.values.plan_type
              }
            >
              {(planType) =>
                planType === "perpetual" ? (
                  <>
                    {/* AMC PRICE */}

                    <form.Field
                      name="plan_amc_price"
                      children={(field) => (
                        <Field>
                          <FieldLabel>
                            AMC Price
                          </FieldLabel>

                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={
                              field.state.value ??
                              ""
                            }
                            onChange={(event) => {
                              const value =
                                event.target.value

                              field.handleChange(
                                value === ""
                                  ? null
                                  : Number(value),
                              )
                            }}
                            onBlur={field.handleBlur}
                            placeholder="Enter AMC Price"
                            disabled={loading}
                          />

                          {field.state.meta
                            .isTouched &&
                            !field.state.meta
                              .isValid && (
                              <FieldError>
                                {getErrorText(
                                  field.state.meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                        </Field>
                      )}
                    />

                    {/* AMC DURATION */}

                    <form.Field
                      name="plan_amc_duration_months"
                      children={(field) => (
                        <Field>
                          <FieldLabel>
                            AMC Duration (Months)
                          </FieldLabel>

                          <Input
                            type="number"
                            min={1}
                            value={
                              field.state.value ??
                              ""
                            }
                            onChange={(event) => {
                              const value =
                                event.target.value

                              field.handleChange(
                                value === ""
                                  ? null
                                  : Number(value),
                              )
                            }}
                            onBlur={field.handleBlur}
                            placeholder="Enter AMC Duration"
                            disabled={loading}
                          />

                          {field.state.meta
                            .isTouched &&
                            !field.state.meta
                              .isValid && (
                              <FieldError>
                                {getErrorText(
                                  field.state.meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                        </Field>
                      )}
                    />

                    {/* AMC GST */}

                    <form.Field
                      name="plan_amc_gst_percentage"
                      children={(field) => (
                        <Field>
                          <FieldLabel>
                            AMC GST (%)
                          </FieldLabel>

                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            value={
                              field.state.value
                            }
                            onChange={(event) =>
                              field.handleChange(
                                Number(
                                  event.target.value,
                                ) || 0,
                              )
                            }
                            onBlur={field.handleBlur}
                            placeholder="Enter AMC GST %"
                            disabled={loading}
                          />

                          {field.state.meta
                            .isTouched &&
                            !field.state.meta
                              .isValid && (
                              <FieldError>
                                {getErrorText(
                                  field.state.meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                        </Field>
                      )}
                    />

                    {/* AMC START DATE */}

                    <form.Field
                      name="plan_amc_start_date"
                      children={(field) => (
                        <Field>
                          <FieldLabel>
                            AMC Start Date
                          </FieldLabel>

                          <Input
                          className=" cursor-pointer"
                            type="date"
                            value={
                              field.state.value ??
                              ""
                            }
                            onChange={(event) =>
                              field.handleChange(
                                event.target.value ||
                                  null,
                              )
                            }
                            onBlur={field.handleBlur}
                            disabled={loading}
                          />

                          {field.state.meta
                            .isTouched &&
                            !field.state.meta
                              .isValid && (
                              <FieldError>
                                {getErrorText(
                                  field.state.meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                        </Field>
                      )}
                    />
                  </>
                ) : null
              }
            </form.Subscribe>
          </FieldGroup>
        </FormStep>
      </form>
    </FormWizard>
  )
}
