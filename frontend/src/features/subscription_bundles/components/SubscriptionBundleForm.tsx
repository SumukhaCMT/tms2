
import { useForm } from "@tanstack/react-form"
import { useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Search, X, } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import {
  Card,
  CardContent,
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

import { Checkbox } from "@/components/ui/checkbox"
////subscriptionBundleSchema, add in validation line no 39 for zod validation 
import {
  
  type SubscriptionBundleFormValues,
} from "../subscriptionBundleValidation"

import type { SubscriptionBundle, BundleType} from "../subscriptionBundleTypes"

interface SubscriptionBundleFormProps {
  initialData?: SubscriptionBundle
  loading?: boolean
  onSubmit: (
    data: SubscriptionBundleFormValues,
  ) => Promise<void>
  onCancel: () => void
}

export default function SubscriptionBundleForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: SubscriptionBundleFormProps) {
  /* ============================================================
     SUBSCRIPTION PLANS
  ============================================================ */

  const plans = useSelector(
    (state: RootState) =>
      state.subscriptionPlans?.plans ?? [],
  )

  // IMPORTANT: Hooks must stay at component level, never inside form.Field callbacks.
  const [planSearch, setPlanSearch] = useState("")
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false)

  /* ============================================================
     DEFAULT VALUES
  ============================================================ */

  const defaultValues: SubscriptionBundleFormValues = {
    bundle_name:
      initialData?.bundle_name ?? "",

    bundle_code:
      initialData?.bundle_code ?? "",

    bundle_type:
      initialData?.bundle_type ?? "subscription",

    bundle_duration_months:
      initialData?.bundle_type ===
        "subscription" &&
      initialData?.bundle_duration_months !=
        null
        ? Number(
            initialData.bundle_duration_months,
          )
        : initialData?.bundle_type ===
            "subscription"
          ? null
          : null,

    bundle_price:
      initialData?.bundle_price != null
        ? Number(initialData.bundle_price)
        : 0,

    bundle_gst_percentage:
      initialData?.bundle_gst_percentage !=
      null
        ? Number(
            initialData.bundle_gst_percentage,
          )
        : 18,

    bundle_total_price:
      initialData?.bundle_total_price !=
      null
        ? Number(
            initialData.bundle_total_price,
          )
        : 0,

    bundle_amc_price:
      initialData?.bundle_type ===
        "perpetual" &&
      initialData?.bundle_amc_price != null
        ? Number(
            initialData.bundle_amc_price,
          )
        : null,

    bundle_amc_duration_months:
      initialData?.bundle_type ===
        "perpetual" &&
      initialData?.bundle_amc_duration_months !=
        null
        ? Number(
            initialData.bundle_amc_duration_months,
          )
        : null,

    bundle_amc_gst_percentage:
      initialData?.bundle_type ===
        "perpetual" &&
      initialData?.bundle_amc_gst_percentage !=
        null
        ? Number(
            initialData
              .bundle_amc_gst_percentage,
          )
        : null,

    bundle_status:
      initialData?.bundle_status ??
      "active",

    plan_ids: Array.isArray(
      initialData?.plan_ids,
    )
      ? [
          ...new Set(
            initialData.plan_ids
              .map(Number)
              .filter(
                (id) =>
                  Number.isInteger(id) &&
                  id > 0,
              ),
          ),
        ]
      : [],
  }

  /* ============================================================
     FORM
  ============================================================ */

  const form = useForm({
    defaultValues,

    // validators: {
    //   onSubmit: subscriptionBundleSchema,
    // },

    onSubmit: async ({ value }) => {
      /*
       * Normalize according to bundle type.
       */

      const isSubscription =
        value.bundle_type ===
        "subscription"

      const planIds = [
        ...new Set(
          value.plan_ids
            .map(Number)
            .filter(
              (id) =>
                Number.isInteger(id) &&
                id > 0,
            ),
        ),
      ]

      const price =
        Number(value.bundle_price) || 0

      const gst =
        Number(
          value.bundle_gst_percentage,
        ) || 0

      const total =
        Number(
          (
            price +
            (price * gst) / 100
          ).toFixed(2),
        )

      const submitData: SubscriptionBundleFormValues =
        isSubscription
          ? {
              bundle_name:
                value.bundle_name.trim(),

              bundle_code:
                value.bundle_code
                  .trim()
                  .toUpperCase(),

              bundle_type:
                "subscription",

              bundle_duration_months:
                value.bundle_duration_months !=
                null
                  ? Number(
                      value.bundle_duration_months,
                    )
                  : null,

              bundle_price: price,

              bundle_gst_percentage:
                gst,

              bundle_total_price:
                total,

              bundle_amc_price: null,

              bundle_amc_duration_months:
                null,

              bundle_amc_gst_percentage:
                null,

              bundle_status:
                value.bundle_status,

              plan_ids: planIds,
            }
          : {
              bundle_name:
                value.bundle_name.trim(),

              bundle_code:
                value.bundle_code
                  .trim()
                  .toUpperCase(),

              bundle_type:
                "perpetual",

              bundle_duration_months:
                null,

              bundle_price: price,

              bundle_gst_percentage:
                gst,

              bundle_total_price:
                total,

              bundle_amc_price:
                value.bundle_amc_price !=
                null
                  ? Number(
                      value.bundle_amc_price,
                    )
                  : null,

              bundle_amc_duration_months:
                value.bundle_amc_duration_months !=
                null
                  ? Number(
                      value.bundle_amc_duration_months,
                    )
                  : null,

              bundle_amc_gst_percentage:
                value.bundle_amc_gst_percentage !=
                null
                  ? Number(
                      value.bundle_amc_gst_percentage,
                    )
                  : null,

              bundle_status:
                value.bundle_status,

              plan_ids: planIds,
            }

      console.log(
        "================================",
      )

      console.log(
        "BUNDLE FORM SUBMIT",
      )

      console.log(
        "TYPE:",
        submitData.bundle_type,
      )

      console.log(
        "DURATION:",
        submitData.bundle_duration_months,
      )

      console.log(
        "AMC PRICE:",
        submitData.bundle_amc_price,
      )

      console.log(
        "AMC DURATION:",
        submitData.bundle_amc_duration_months,
      )

      console.log(
        "AMC GST:",
        submitData.bundle_amc_gst_percentage,
      )

      console.log(
        "PLAN IDS:",
        submitData.plan_ids,
      )

      console.log(
        "FINAL DATA:",
        submitData,
      )

      console.log(
        "================================",
      )

      await onSubmit(submitData)
    },
  })

  /* ============================================================
     TOTAL CALCULATION
  ============================================================ */

  const calculateTotalPrice = (
    price: number,
    gst: number,
  ): number => {
    const safePrice =
      Number(price) || 0

    const safeGst =
      Number(gst) || 0

    return Number(
      (
        safePrice +
        (safePrice * safeGst) / 100
      ).toFixed(2),
    )
  }

  /* ============================================================
     ERROR TEXT
  ============================================================ */

  const getErrorText = (
    errors: unknown[],
  ): string =>
    errors
      .map((error) => {
        if (
          typeof error === "string"
        ) {
          return error
        }

        if (
          error &&
          typeof error === "object" &&
          "message" in error
        ) {
          return String(
            (
              error as {
                message?: unknown
              }
            ).message ?? "",
          )
        }

        return ""
      })
      .filter(Boolean)
      .join(", ")

  /* ============================================================
     BUNDLE PRICE CHANGE
  ============================================================ */

  const handleBundlePriceChange = (
    value: string,
  ) => {
    const price =
      value === ""
        ? 0
        : Number(value)

    const gst =
      Number(
        form.state.values
          .bundle_gst_percentage,
      ) || 0

    const total =
      calculateTotalPrice(
        price,
        gst,
      )

    form.setFieldValue(
      "bundle_price",
      price,
    )

    form.setFieldValue(
      "bundle_total_price",
      total,
    )
  }

  /* ============================================================
     GST CHANGE
  ============================================================ */

  const handleGstChange = (
    value: string,
  ) => {
    const gst =
      value === ""
        ? 0
        : Number(value)

    const price =
      Number(
        form.state.values
          .bundle_price,
      ) || 0

    const total =
      calculateTotalPrice(
        price,
        gst,
      )

    form.setFieldValue(
      "bundle_gst_percentage",
      gst,
    )

    form.setFieldValue(
      "bundle_total_price",
      total,
    )
  }

  /* ============================================================
     BUNDLE TYPE CHANGE
  ============================================================ */

  // const handleBundleTypeChange = (
  //   value: string,
  // ) => {
  const handleBundleTypeChange = (
  value: BundleType | null,
) => {
  // Base UI Select can return null
  if (value === null) {
    return
  }
    const newType =
      value as SubscriptionBundleFormValues["bundle_type"]

    form.setFieldValue(
      "bundle_type",
      newType,
    )

    /*
     * SUBSCRIPTION
     */

    if (
      newType === "subscription"
    ) {
      /*
       * Clear AMC fields.
       */

      form.setFieldValue(
        "bundle_amc_price",
        null,
      )

      form.setFieldValue(
        "bundle_amc_duration_months",
        null,
      )

      form.setFieldValue(
        "bundle_amc_gst_percentage",
        null,
      )

      /*
       * If duration is empty,
       * give it a usable default.
       */

      const currentDuration =
        form.state.values
          .bundle_duration_months

      if (
        currentDuration == null ||
        !Number.isInteger(
          Number(currentDuration),
        ) ||
        Number(currentDuration) <= 0
      ) {
        form.setFieldValue(
          "bundle_duration_months",
          12,
        )
      }
    }

    /*
     * PERPETUAL
     */

    if (
      newType === "perpetual"
    ) {
      /*
       * Subscription duration
       * must be null.
       */

      form.setFieldValue(
        "bundle_duration_months",
        null,
      )

      /*
       * AMC defaults.
       */

      const currentAmcPrice =
        form.state.values
          .bundle_amc_price

      if (
        currentAmcPrice == null
      ) {
        form.setFieldValue(
          "bundle_amc_price",
          0,
        )
      }

      const currentAmcDuration =
        form.state.values
          .bundle_amc_duration_months

      if (
        currentAmcDuration ==
          null ||
        !Number.isInteger(
          Number(
            currentAmcDuration,
          ),
        ) ||
        Number(
          currentAmcDuration,
        ) <= 0
      ) {
        form.setFieldValue(
          "bundle_amc_duration_months",
          12,
        )
      }

      const currentAmcGst =
        form.state.values
          .bundle_amc_gst_percentage

      if (
        currentAmcGst == null
      ) {
        form.setFieldValue(
          "bundle_amc_gst_percentage",
          18,
        )
      }
    }
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()

        void form.handleSubmit()
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData
              ? "Edit Subscription Bundle"
              : "Add Subscription Bundle"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* ========================================================
                BUNDLE NAME
            ======================================================== */}

            <form.Field
              name="bundle_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      Bundle Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          event.target
                            .value,
                        )
                      }
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="Enter Bundle Name"
                      disabled={
                        loading
                      }
                      aria-invalid={
                        isInvalid
                      }
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================
                BUNDLE CODE
            ======================================================== */}

            <form.Field
              name="bundle_code"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      Bundle Code
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value
                            .toUpperCase(),
                        )
                      }
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="TEMPLE_PRO_BUNDLE"
                      disabled={
                        loading
                      }
                      aria-invalid={
                        isInvalid
                      }
                    />

                    <FieldDescription>
                      Use uppercase
                      letters, numbers,
                      "_" or "-".
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================
                BUNDLE TYPE
            ======================================================== */}

          
<form.Field
  name="bundle_type"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched &&
      !field.state.meta.isValid

    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel>
          Bundle Type
          <span className="text-destructive">
            *
          </span>
        </FieldLabel>

        <Select
          value={field.state.value}
          onValueChange={handleBundleTypeChange}
       
          disabled={loading}
        >
          <SelectTrigger
            aria-invalid={isInvalid}
          >
            <SelectValue placeholder="Select Bundle Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="subscription">
              Subscription
            </SelectItem>

            <SelectItem value="perpetual">
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
            {/* ========================================================
                SUBSCRIPTION DURATION
            ======================================================== */}

            <form.Subscribe
              selector={(state) =>
                state.values
                  .bundle_type
              }
            >
              {(bundleType) =>
                bundleType ===
                "subscription" ? (
                  <form.Field
                    name="bundle_duration_months"
                    children={(
                      field,
                    ) => {
                      const isInvalid =
                        field.state
                          .meta
                          .isTouched &&
                        !field.state
                          .meta
                          .isValid

                      return (
                        <Field
                          data-invalid={
                            isInvalid
                          }
                        >
                          <FieldLabel>
                            Duration
                            (Months)
                            <span className="text-destructive">
                              *
                            </span>
                          </FieldLabel>

                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={
                              field
                                .state
                                .value ??
                              ""
                            }
                            onChange={(
                              event,
                            ) => {
                              const value =
                                event
                                  .target
                                  .value

                              field.handleChange(
                                value ===
                                  ""
                                  ? null
                                  : Number(
                                      value,
                                    ),
                              )
                            }}
                            onBlur={
                              field.handleBlur
                            }
                            placeholder="Enter Duration"
                            disabled={
                              loading
                            }
                            aria-invalid={
                              isInvalid
                            }
                          />

                          <FieldDescription>
                            Required for
                            subscription
                            bundles.
                          </FieldDescription>

                          {isInvalid && (
                            <FieldError>
                              {getErrorText(
                                field
                                  .state
                                  .meta
                                  .errors,
                              )}
                            </FieldError>
                          )}
                        </Field>
                      )
                    }}
                  />
                ) : null
              }
            </form.Subscribe>

            {/* ========================================================
                BUNDLE PRICE
            ======================================================== */}

            <form.Field
              name="bundle_price"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      Bundle Price
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        handleBundlePriceChange(
                          event.target
                            .value,
                        )
                      }
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="Enter Bundle Price"
                      disabled={
                        loading
                      }
                      aria-invalid={
                        isInvalid
                      }
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================
                GST
            ======================================================== */}

            <form.Field
              name="bundle_gst_percentage"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      GST (%)
                      <span className="text-destructive">
                        *
                      </span>
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
                        handleGstChange(
                          event.target
                            .value,
                        )
                      }
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="Enter GST %"
                      disabled={
                        loading
                      }
                      aria-invalid={
                        isInvalid
                      }
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================
                TOTAL PRICE
            ======================================================== */}

            <form.Field
              name="bundle_total_price"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      Total Price
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="number"
                      value={
                        field.state.value
                      }
                      readOnly
                      disabled={
                        loading
                      }
                      aria-invalid={
                        isInvalid
                      }
                    />

                    <FieldDescription>
                      Bundle Price +
                      GST.
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ========================================================
                AMC FIELDS
            ======================================================== */}

            <form.Subscribe
              selector={(state) =>
                state.values
                  .bundle_type
              }
            >
              {(bundleType) =>
                bundleType ===
                "perpetual" ? (
                  <>
                    {/* AMC PRICE */}

                    <form.Field
                      name="bundle_amc_price"
                      children={(
                        field,
                      ) => {
                        const isInvalid =
                          field.state
                            .meta
                            .isTouched &&
                          !field.state
                            .meta
                            .isValid

                        return (
                          <Field
                            data-invalid={
                              isInvalid
                            }
                          >
                            <FieldLabel>
                              AMC Price
                              <span className="text-destructive">
                                *
                              </span>
                            </FieldLabel>

                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={
                                field
                                  .state
                                  .value ??
                                ""
                              }
                              onChange={(
                                event,
                              ) => {
                                const value =
                                  event
                                    .target
                                    .value

                                field.handleChange(
                                  value ===
                                    ""
                                    ? null
                                    : Number(
                                        value,
                                      ),
                                )
                              }}
                              onBlur={
                                field.handleBlur
                              }
                              placeholder="Enter AMC Price"
                              disabled={
                                loading
                              }
                              aria-invalid={
                                isInvalid
                              }
                            />

                            {isInvalid && (
                              <FieldError>
                                {getErrorText(
                                  field
                                    .state
                                    .meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                          </Field>
                        )
                      }}
                    />

                    {/* AMC DURATION */}

                    <form.Field
                      name="bundle_amc_duration_months"
                      children={(
                        field,
                      ) => {
                        const isInvalid =
                          field.state
                            .meta
                            .isTouched &&
                          !field.state
                            .meta
                            .isValid

                        return (
                          <Field
                            data-invalid={
                              isInvalid
                            }
                          >
                            <FieldLabel>
                              AMC Duration
                              (Months)
                              <span className="text-destructive">
                                *
                              </span>
                            </FieldLabel>

                            <Input
                              type="number"
                              min={1}
                              step={1}
                              value={
                                field
                                  .state
                                  .value ??
                                ""
                              }
                              onChange={(
                                event,
                              ) => {
                                const value =
                                  event
                                    .target
                                    .value

                                field.handleChange(
                                  value ===
                                    ""
                                    ? null
                                    : Number(
                                        value,
                                      ),
                                )
                              }}
                              onBlur={
                                field.handleBlur
                              }
                              placeholder="Enter AMC Duration"
                              disabled={
                                loading
                              }
                              aria-invalid={
                                isInvalid
                              }
                            />

                            {isInvalid && (
                              <FieldError>
                                {getErrorText(
                                  field
                                    .state
                                    .meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                          </Field>
                        )
                      }}
                    />

                    {/* AMC GST */}

                    <form.Field
                      name="bundle_amc_gst_percentage"
                      children={(
                        field,
                      ) => {
                        const isInvalid =
                          field.state
                            .meta
                            .isTouched &&
                          !field.state
                            .meta
                            .isValid

                        return (
                          <Field
                            data-invalid={
                              isInvalid
                            }
                          >
                            <FieldLabel>
                              AMC GST
                              (%)
                              <span className="text-destructive">
                                *
                              </span>
                            </FieldLabel>

                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              value={
                                field
                                  .state
                                  .value ??
                                ""
                              }
                              onChange={(
                                event,
                              ) => {
                                const value =
                                  event
                                    .target
                                    .value

                                field.handleChange(
                                  value ===
                                    ""
                                    ? null
                                    : Number(
                                        value,
                                      ),
                                )
                              }}
                              onBlur={
                                field.handleBlur
                              }
                              placeholder="Enter AMC GST %"
                              disabled={
                                loading
                              }
                              aria-invalid={
                                isInvalid
                              }
                            />

                            {isInvalid && (
                              <FieldError>
                                {getErrorText(
                                  field
                                    .state
                                    .meta
                                    .errors,
                                )}
                              </FieldError>
                            )}
                          </Field>
                        )
                      }}
                    />
                  </>
                ) : null
              }
            </form.Subscribe>

            {/* ========================================================
                SUBSCRIPTION PLANS
            ======================================================== */}

           
           
<form.Field
  name="plan_ids"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched &&
      !field.state.meta.isValid

    const selectedPlanIds = field.state.value ?? []

    const filteredPlans = plans.filter((plan) => {
      const search = planSearch
        .toLowerCase()
        .trim()

      if (!search) return true

      return (
        plan.plan_name
          ?.toLowerCase()
          .includes(search) ||
        plan.plan_code
          ?.toLowerCase()
          .includes(search)
      )
    })

    const allPlanIds = plans.map((plan) =>
      Number(plan.id),
    )

    const allSelected =
      allPlanIds.length > 0 &&
      allPlanIds.every((id) =>
        selectedPlanIds.includes(id),
      )

    const selectedPlans = plans.filter((plan) =>
      selectedPlanIds.includes(Number(plan.id)),
    )

    const handleSelectAll = () => {
      field.handleChange(allPlanIds)
      field.handleBlur()
    }

    const handleClearAll = () => {
      field.handleChange([])
      field.handleBlur()
    }

    const handleTogglePlan = (planId: number) => {
      const current = selectedPlanIds

      if (current.includes(planId)) {
        field.handleChange(
          current.filter((id) => id !== planId),
        )
      } else {
        field.handleChange([
          ...current,
          planId,
        ])
      }

      field.handleBlur()
    }

    return (
      <Field
        className="lg:col-span-3"
        data-invalid={isInvalid}
      >
        <FieldLabel>
          Subscription Plans
          <span className="text-destructive">
            *
          </span>
        </FieldLabel>

        <FieldDescription>
          Search and select one or more
          subscription plans.
        </FieldDescription>

        <Popover
          open={planDropdownOpen}
          onOpenChange={setPlanDropdownOpen}
        >
          <PopoverTrigger >
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={planDropdownOpen}
              disabled={
                loading 
              }
              className="w-full justify-between font-normal"
            >
              <div className="flex min-w-0 items-center gap-2">
                {selectedPlans.length === 0 ? (
                  <span className="text-muted-foreground">
                    Select subscription plans
                  </span>
                ) : (
                  <span className="truncate">
                    {selectedPlans.length} plan
                    {selectedPlans.length !== 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </span>
                )}
              </div>

              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <div className="flex flex-col">
              {/* Search */}
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

                <Input
                  value={planSearch}
                  onChange={(event) =>
                    setPlanSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search plans..."
                  className="border-0 px-0 focus-visible:ring-0"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-b p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={
                    loading ||
                   
                    plans.length === 0 ||
                    allSelected
                  }
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={
                    loading ||
                  
                    selectedPlanIds.length === 0
                  }
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>

              {/* Selected count */}
              {selectedPlanIds.length > 0 && (
                <div className="border-b bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {selectedPlanIds.length} of{" "}
                    {plans.length} plans selected
                  </p>
                </div>
              )}

              {/* Plans */}
              <div className="max-h-64 overflow-y-auto p-1">
                {loading ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Loading subscription plans...
                  </p>
                ) : plans.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No subscription plans
                    available.
                  </p>
                ) : filteredPlans.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No plans found.
                  </p>
                ) : (
                  filteredPlans.map((plan) => {
                    const planId = Number(plan.id)

                    const checked =
                      selectedPlanIds.includes(
                        planId,
                      )

                    return (
                      <button
                        key={planId}
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleTogglePlan(planId)
                        }
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                      >
                        <Checkbox
                          checked={checked}
                          tabIndex={-1}
                          className="pointer-events-none"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {plan.plan_name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {plan.plan_code}
                          </p>
                        </div>

                        {checked && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Selected plans */}
        {selectedPlans.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                <span className="max-w-[200px] truncate">
                  {plan.plan_name}
                </span>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleTogglePlan(
                      Number(plan.id),
                    )
                  }
                  className="ml-1 rounded-sm opacity-60 hover:opacity-100 disabled:pointer-events-none"
                  aria-label={`Remove ${plan.plan_name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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





            {/* ========================================================
                STATUS
            ======================================================== */}

            <form.Field
              name="bundle_status"
              children={(field) => {
                const isInvalid =
                  field.state.meta
                    .isTouched &&
                  !field.state.meta
                    .isValid

                return (
                  <Field
                    data-invalid={
                      isInvalid
                    }
                  >
                    <FieldLabel>
                      Status
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                      }
                      onValueChange={(
                        value,
                      ) => {
                        field.handleChange(
                          value as SubscriptionBundleFormValues["bundle_status"],
                        )

                        field.handleBlur()
                      }}
                      disabled={
                        loading
                      }
                    >
                      <SelectTrigger
                        aria-invalid={
                          isInvalid
                        }
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
                          field.state
                            .meta
                            .errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          BUTTONS
      ============================================================ */}

      <div className="flex justify-end gap-3">
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          className="cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Bundle"
              : "Create Bundle"}
        </Button>
      </div>
    </form>
  )
}