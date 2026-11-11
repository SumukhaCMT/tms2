import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Check, CreditCard, Loader2, Package, ReceiptText, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { apiErrorMessage } from "@/features/subscription/services/cartService"
import { FormWizard } from "@/components/ui/form-wizard"
import { DateField, SelectField, TextField, TextareaField } from "@/features/donations/shared/DonationFormFields"
import { DateTimeField } from "@/features/hundi/shared/HundiFormFields"
import { type FormErrors, type StepDefinition } from "@/features/donations/shared/donationFormTypes"
import { StateField } from "@/components/ui/state-select"
import { digitsOnly, normalizeIndiaState } from "@/features/donations/shared/donationFormLogic"

import { SearchSelectField } from "./SearchSelectField"
import {
  getManualOrderOptions,
  type ManualOrderForm,
  type ManualOrderOptions,
} from "./manualOrderService"

const STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Plan", subLabel: "What was purchased", icon: Package },
  { id: 2, label: "Order", subLabel: "Who placed it", icon: ShoppingCart },
  { id: 3, label: "Payment", subLabel: "How it was paid", icon: CreditCard },
  { id: 4, label: "Billing", subLabel: "Invoice details", icon: ReceiptText },
]

const REQUIRED: Record<number, [keyof ManualOrderForm, string][]> = {
  1: [["plan_id", "Plan"], ["license_type", "License type"], ["item_type", "Item type"], ["start_date", "Start date"]],
  2: [
    ["organization_id", "Organization"],
    ["placed_by_name", "Placed by name"],
    ["payment_method", "Payment method"],
    ["order_status", "Order status"],
  ],
  4: [
    ["billing_name", "Billing name"],
    ["billing_email", "Email"],
    ["billing_phone", "Phone"],
    ["billing_address_line1", "Billing address 1"],
    ["billing_city", "City"],
    ["billing_state", "State"],
    ["billing_country", "Country"],
    ["paid_at", "Paid at"],
  ],
}

const MANUAL_REQUIRED: [keyof ManualOrderForm, string][] = [
  ["payment_status", "Payment status"],
  ["manual_payment_mode", "Manual payment mode"],
  ["manual_payment_date", "Manual payment date"],
  ["manual_payment_recorded_by_name", "Recorded by name"],
]

const GATEWAY_REQUIRED: [keyof ManualOrderForm, string][] = [
  ["payment_status", "Payment status"],
  ["payment_gateway", "Payment gateway"],
  ["gateway_order_id", "Gateway order id"],
  ["gateway_payment_id", "Gateway payment id"],
]

const toLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const toOptions = (values: string[] = []) => values.map((value) => ({ value, label: toLabel(value) }))

const addMonths = (date: string, months: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCMonth(value.getUTCMonth() + Math.round(months))
  return value.toISOString().slice(0, 10)
}

interface ManualOrderWizardProps {
  initialForm: ManualOrderForm
  isEdit?: boolean
  onSubmit: (form: ManualOrderForm) => Promise<{ order_number: string }>
}

export function ManualOrderWizard({ initialForm, isEdit, onSubmit }: ManualOrderWizardProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ManualOrderForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [options, setOptions] = useState<ManualOrderOptions>({ plans: [], organizations: [], enums: {} })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getManualOrderOptions().then(setOptions)
  }, [])

  const isManual = form.payment_method === "manual"
  const plan = options.plans.find((item) => String(item.id) === form.plan_id)

  const endDate = useMemo(() => {
    if (!plan || !form.start_date || form.license_type !== "subscription" || !plan.plan_duration_months) return ""
    return addMonths(form.start_date, Number(plan.plan_duration_months))
  }, [plan, form.start_date, form.license_type])

  const planOptions = useMemo(
    () =>
      options.plans
        .filter((item) => item.plan_status === "active" || String(item.id) === initialForm.plan_id)
        .map((item) => ({ value: String(item.id), label: `${item.plan_name} — ₹${item.plan_total_price}` })),
    [options.plans, initialForm.plan_id]
  )

  const organizationOptions = useMemo(
    () => options.organizations.map((item) => ({ value: String(item.id), label: item.org_name })),
    [options.organizations]
  )

  function update<K extends keyof ManualOrderForm>(key: K, value: ManualOrderForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  function selectPlan(value: string) {
    const selected = options.plans.find((item) => String(item.id) === value)
    setForm((current) => ({ ...current, plan_id: value, license_type: selected?.plan_type ?? "", item_type: "plan" }))
    setErrors((current) => ({ ...current, plan_id: "", license_type: "", item_type: "" }))
  }

  function selectOrganization(value: string) {
    const org = options.organizations.find((item) => String(item.id) === value)
    if (!org) return
    setForm((current) => ({
      ...current,
      organization_id: value,
      billing_name: org.billing_name ?? "",
      billing_gst_number: org.org_gst_number ?? "",
      billing_email: org.org_email ?? "",
      billing_phone: digitsOnly(org.org_phone ?? "").slice(-10),
      billing_address_line1: org.org_address_line1 ?? "",
      billing_address_line2: org.org_address_line2 ?? "",
      billing_city: org.org_city ?? "",
      billing_state: normalizeIndiaState(org.org_state ?? ""),
      billing_country: org.org_country || "India",
    }))
    setErrors({})
  }

  function validate(target: number) {
    const fields = target === 3 ? (isManual ? MANUAL_REQUIRED : GATEWAY_REQUIRED) : REQUIRED[target]
    const next: FormErrors = {}
    fields.forEach(([key, label]) => {
      if (!form[key].trim()) next[key] = `${label} is required`
    })
    if (target === 4 && form.billing_email && !/^\S+@\S+\.\S+$/.test(form.billing_email)) {
      next.billing_email = "Enter a valid email"
    }
    if (target === 4 && form.billing_phone && form.billing_phone.length !== 10) {
      next.billing_phone = "Enter a 10-digit phone number"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleNext() {
    if (validate(step)) setStep(step + 1)
  }

  function handleSubmit() {
    if (!validate(4)) return
    setSubmitting(true)
    onSubmit(form)
      .then((order) => {
        showCmtToast("success", `Order ${order.order_number} ${isEdit ? "updated" : "created"} successfully.`)
        navigate("/manual_order")
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error)))
      .finally(() => setSubmitting(false))
  }

  const title =
    step === 1 ? "Plan Details" : step === 2 ? "Order Details" : step === 3 ? (isManual ? "Manual Mode" : "Gateway Mode") : "Billing Details"

  return (
    <FormWizard
      steps={STEPS}
      currentStep={step}
      title={title}
      subtitle={isEdit ? `Editing ${form.order_number}` : "Record an order paid directly to the super admin"}
      onBack={() => setStep(step - 1)}
      backDisabled={step === 1 || submitting}
      footer={
        step < 4 ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Check />} {isEdit ? "Update Order" : "Create Order"}
          </Button>
        )
      }
    >
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SearchSelectField
            name="plan_id"
            label="Plan"
            required
            value={form.plan_id}
            onChange={selectPlan}
            options={planOptions}
            error={errors.plan_id}
            placeholder={planOptions.length ? "Select plan" : "Loading plans…"}
          />
          <SelectField
            name="license_type"
            label="License Type"
            required
            disabled={!!form.plan_id}
            value={form.license_type}
            onChange={(value) => update("license_type", value)}
            options={toOptions(options.enums.license_type)}
            error={errors.license_type}
          />
          <SelectField
            name="item_type"
            label="Item Type"
            required
            disabled={!!form.plan_id}
            value={form.item_type}
            onChange={(value) => update("item_type", value)}
            options={toOptions(options.enums.item_type)}
            error={errors.item_type}
          />
          <DateField
            name="start_date"
            label="Start Date"
            required
            allowFuture
            value={form.start_date}
            onChange={(value) => update("start_date", value)}
            error={errors.start_date}
          />
          <TextField
            name="end_date"
            label="End Date"
            readOnly
            value={endDate || (form.license_type === "perpetual" ? "Perpetual" : "")}
            onChange={() => undefined}
            helperText={plan?.plan_duration_months ? `${Number(plan.plan_duration_months)} month plan` : undefined}
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SearchSelectField
            name="organization_id"
            label="Organization Name"
            required
            value={form.organization_id}
            onChange={selectOrganization}
            options={organizationOptions}
            error={errors.organization_id}
            placeholder={organizationOptions.length ? "Select organization" : "Loading organizations…"}
          />
          <TextField
            name="placed_by_name"
            label="Placed By Name"
            required
            value={form.placed_by_name}
            onChange={(value) => update("placed_by_name", value)}
            error={errors.placed_by_name}
          />
          <TextField name="order_number" label="Order Number" readOnly value={form.order_number} onChange={() => undefined} />
          <SelectField
            name="payment_method"
            label="Payment Method"
            required
            value={form.payment_method}
            onChange={(value) => update("payment_method", value)}
            options={toOptions(options.enums.payment_method)}
            error={errors.payment_method}
          />
          <SelectField
            name="order_status"
            label="Order Status"
            required
            value={form.order_status}
            onChange={(value) => update("order_status", value)}
            options={toOptions(options.enums.order_status)}
            error={errors.order_status}
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            name="payment_status"
            label="Payment Status"
            required
            value={form.payment_status}
            onChange={(value) => update("payment_status", value)}
            options={toOptions(options.enums.payment_status)}
            error={errors.payment_status}
          />
          {isManual ? (
            <>
              <SelectField
                name="manual_payment_mode"
                label="Manual Payment Mode"
                required
                value={form.manual_payment_mode}
                onChange={(value) => update("manual_payment_mode", value)}
                options={toOptions(options.enums.manual_payment_mode)}
                error={errors.manual_payment_mode}
              />
              <DateField
                name="manual_payment_date"
                label="Manual Payment Date"
                required
                value={form.manual_payment_date}
                onChange={(value) => update("manual_payment_date", value)}
                error={errors.manual_payment_date}
              />
              <TextField
                name="manual_payment_recorded_by_name"
                label="Manual Payment Recorded By"
                required
                value={form.manual_payment_recorded_by_name}
                onChange={(value) => update("manual_payment_recorded_by_name", value)}
                error={errors.manual_payment_recorded_by_name}
              />
            </>
          ) : (
            <>
              <TextField
                name="payment_gateway"
                label="Payment Gateway"
                required
                value={form.payment_gateway}
                onChange={(value) => update("payment_gateway", value)}
                error={errors.payment_gateway}
                placeholder="e.g. razorpay"
              />
              <TextField
                name="gateway_order_id"
                label="Gateway Order ID"
                required
                value={form.gateway_order_id}
                onChange={(value) => update("gateway_order_id", value)}
                error={errors.gateway_order_id}
              />
              <TextField
                name="gateway_payment_id"
                label="Gateway Payment ID"
                required
                value={form.gateway_payment_id}
                onChange={(value) => update("gateway_payment_id", value)}
                error={errors.gateway_payment_id}
              />
              <TextField
                name="gateway_signature"
                label="Gateway Signature"
                value={form.gateway_signature}
                onChange={(value) => update("gateway_signature", value)}
                error={errors.gateway_signature}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <TextareaField
                  name="gateway_full_response"
                  label="Gateway Full Response"
                  value={form.gateway_full_response}
                  onChange={(value) => update("gateway_full_response", value)}
                  error={errors.gateway_full_response}
                  placeholder="Raw JSON response from the gateway"
                />
              </div>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              name="billing_name"
              label="Billing Name"
              required
              value={form.billing_name}
              onChange={(value) => update("billing_name", value)}
              error={errors.billing_name}
            />
            <TextField
              name="billing_gst_number"
              label="GST Number"
              maxLength={15}
              value={form.billing_gst_number}
              onChange={(value) => update("billing_gst_number", value.toUpperCase())}
              error={errors.billing_gst_number}
            />
            <TextField
              name="billing_email"
              label="Email"
              required
              type="email"
              value={form.billing_email}
              onChange={(value) => update("billing_email", value)}
              error={errors.billing_email}
            />
            <TextField
              name="billing_phone"
              label="Phone"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.billing_phone}
              onChange={(value) => update("billing_phone", digitsOnly(value).slice(0, 10))}
              error={errors.billing_phone}
              placeholder="10-digit phone number"
            />
            <TextField
              name="billing_address_line1"
              label="Billing Address 1"
              required
              value={form.billing_address_line1}
              onChange={(value) => update("billing_address_line1", value)}
              error={errors.billing_address_line1}
            />
            <TextField
              name="billing_address_line2"
              label="Billing Address 2"
              value={form.billing_address_line2}
              onChange={(value) => update("billing_address_line2", value)}
              error={errors.billing_address_line2}
            />
            <TextField
              name="billing_city"
              label="City"
              required
              value={form.billing_city}
              onChange={(value) => update("billing_city", value)}
              error={errors.billing_city}
            />
            <StateField
              id="billing_state"
              required
              value={form.billing_state}
              onChange={(value) => update("billing_state", value)}
              error={errors.billing_state}
            />
            <TextField
              name="billing_country"
              label="Country"
              required
              value={form.billing_country}
              onChange={(value) => update("billing_country", value)}
              error={errors.billing_country}
            />
            <DateTimeField
              name="paid_at"
              label="Paid At"
              required
              value={form.paid_at}
              onChange={(value) => update("paid_at", value)}
              error={errors.paid_at}
            />
          </div>
          <TextareaField
            name="note"
            label="Remarks"
            value={form.note}
            onChange={(value) => update("note", value)}
            error={errors.note}
          />
        </div>
      )}
    </FormWizard>
  )
}
