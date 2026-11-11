import { useState, type FormEvent } from "react"
import { ArrowLeft, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { PAYMENT_MODES, cartTotals, formatDate, formatPrice, toDateInput, type CartItem, type CheckoutValues } from "../../pricingCart"

interface Props {
  items: CartItem[]
  submitting: boolean
  onBack: () => void
  onSubmit: (values: CheckoutValues) => void
}

type Errors = Partial<Record<keyof CheckoutValues, string>>

const INITIAL: CheckoutValues = {
  payment_mode: "",
  transaction_number: "",
  payment_date: "",
  remarks: "",
}

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export default function CheckoutForm({ items, submitting, onBack, onSubmit }: Props) {
  const [today] = useState(() => toDateInput(Date.now()))
  const [values, setValues] = useState<CheckoutValues>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [calendarOpen, setCalendarOpen] = useState(false)
  const latest = parseDate(today)
  const [month, setMonth] = useState(latest)
  const totals = cartTotals(items)

  const update = (key: keyof CheckoutValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next: Errors = {}
    if (!values.payment_mode) next.payment_mode = "Select a payment mode"
    if (!values.transaction_number.trim()) next.transaction_number = "Enter the transaction number"
    if (!values.payment_date) next.payment_date = "Select the payment date"
    if (values.payment_date > today) next.payment_date = "Payment date cannot be in the future"
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit({ ...values, transaction_number: values.transaction_number.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-5xl items-start gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">Transaction Details</CardTitle>
          <CardDescription>Enter the details of the payment made for this order.</CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.payment_mode}>
                <FieldLabel>Payment Mode</FieldLabel>
                <Select items={PAYMENT_MODES} value={values.payment_mode} onValueChange={(value) => update("payment_mode", String(value ?? ""))}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.payment_mode}>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_mode && <FieldError>{errors.payment_mode}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.transaction_number}>
                <FieldLabel htmlFor="transaction_number">Transaction / Reference Number</FieldLabel>
                <Input
                  id="transaction_number"
                  placeholder="e.g. UTR or cheque number"
                  value={values.transaction_number}
                  aria-invalid={!!errors.transaction_number}
                  onChange={(event) => update("transaction_number", event.target.value)}
                />
                {errors.transaction_number && <FieldError>{errors.transaction_number}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.payment_date}>
                <FieldLabel htmlFor="payment_date">Payment Date</FieldLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        id="payment_date"
                        aria-invalid={!!errors.payment_date}
                        className="w-full cursor-pointer justify-start font-normal"
                      >
                        <CalendarIcon className="size-4" />
                        {values.payment_date ? (
                          formatDate(values.payment_date)
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </Button>
                    }
                  />
                  <PopoverContent align="start">
                    <Calendar
                      mode="single"
                      selected={values.payment_date ? parseDate(values.payment_date) : undefined}
                      month={month}
                      onMonthChange={setMonth}
                      disabled={(date) => date > latest}
                      onSelect={(date) => {
                        if (!date) return
                        update("payment_date", toDateInput(date.getTime()))
                        setCalendarOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.payment_date && <FieldError>{errors.payment_date}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="amount_paid">Amount Paid</FieldLabel>
                <Input id="amount_paid" value={formatPrice(totals.total)} readOnly disabled />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="remarks">Remarks (optional)</FieldLabel>
              <Textarea
                id="remarks"
                placeholder="Any notes for the reviewer"
                value={values.remarks}
                onChange={(event) => update("remarks", event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-between gap-3">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={onBack}>
            <ArrowLeft />
            Back to Summary
          </Button>
          <Button type="submit" className="cursor-pointer" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Order"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-semibold">Your Order</CardTitle>
          <CardDescription>{items.length} item{items.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.period}</span>
              </div>
              <span>{formatPrice(item.total)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST</span>
            <span>{formatPrice(totals.gst)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
