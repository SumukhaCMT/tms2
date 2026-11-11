import { Check, CircleCheck, Clock, Copy, Rocket } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { PAYMENT_MODES, formatDate, formatPrice, type CheckoutValues } from "../../pricingCart"

interface Props {
  reference: string
  amount: number
  values: CheckoutValues
  onDone: () => void
}

const nextDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function OrderSubmitted({ reference, amount, values, onDone }: Props) {
  const paymentMode = PAYMENT_MODES.find((mode) => mode.value === values.payment_mode)?.label ?? values.payment_mode

  const details = [
    { label: "Payment mode", value: paymentMode },
    { label: "Transaction number", value: values.transaction_number },
    { label: "Payment date", value: formatDate(values.payment_date) },
  ]

  const steps = [
    { icon: Check, title: "Order placed", description: "Your payment details have been recorded.", done: true },
    { icon: Clock, title: "Payment verification", description: "The Super Admin will verify your payment.", done: false },
    { icon: Rocket, title: "Plan activation", description: `Your plan starts from ${formatDate(nextDay(values.payment_date))}.`, done: false },
  ]

  const copyReference = () =>
    navigator.clipboard
      .writeText(reference)
      .then(() => toast.success("Order reference copied"))
      .catch(() => toast.error("Could not copy the order reference"))

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardContent className="flex flex-col gap-8 pt-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50 dark:bg-green-900/30 dark:ring-green-900/10">
            <CircleCheck className="size-8 text-green-600" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Order Submitted</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Your payment details have been sent for verification. We will activate your order once it is approved.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs text-muted-foreground">Order reference</span>
              <div className="flex items-center gap-1">
                <span className="truncate font-mono text-sm font-semibold">{reference}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="cursor-pointer text-muted-foreground"
                  aria-label="Copy order reference"
                  onClick={() => void copyReference()}
                >
                  <Copy />
                </Button>
              </div>
            </div>
            <Badge variant="secondary">Awaiting verification</Badge>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Amount paid</span>
            <span className="text-3xl font-bold tracking-tight">{formatPrice(amount)}</span>
            <span className="text-xs text-muted-foreground">Inclusive of GST</span>
          </div>

          <dl className="grid gap-3 border-t pt-4 sm:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{detail.label}</dt>
                <dd className="truncate text-sm font-medium" title={detail.value}>
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">What happens next</span>
          <ol className="flex flex-col">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border",
                      step.done ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                    )}
                  >
                    <step.icon className="size-4" />
                  </span>
                  {index < steps.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className={cn("flex flex-col gap-0.5 pt-1", index < steps.length - 1 && "pb-5")}>
                  <span className="text-sm font-medium">{step.title}</span>
                  <span className="text-xs text-muted-foreground">{step.description}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <Button className="cursor-pointer" onClick={onDone}>
          Back to Pricing Plans
        </Button>
      </CardFooter>
    </Card>
  )
}
