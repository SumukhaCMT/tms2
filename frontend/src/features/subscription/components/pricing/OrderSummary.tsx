import { ArrowLeft, Crown, MessageSquareText, Package, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { cartTotals, formatPrice, type CartItem } from "../../pricingCart"

interface Props {
  items: CartItem[]
  onRemove: (id: string) => void
  onBack: () => void
  onProceed: () => void
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between text-base font-semibold" : "flex justify-between text-sm text-muted-foreground"}>
      <span>{label}</span>
      <span className={strong ? "" : "text-foreground"}>{value}</span>
    </div>
  )
}

export default function OrderSummary({ items, onRemove, onBack, onProceed }: Props) {
  const totals = cartTotals(items)
  const plans = items.filter((item) => item.kind === "plan")
  const bundles = items.filter((item) => item.kind === "bundle")
  const addons = items.filter((item) => item.kind === "addon")

  if (items.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-xl text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">Your cart is empty</span>
            <span className="text-sm text-muted-foreground">Add a plan or messaging pack to continue.</span>
          </div>
          <Button className="cursor-pointer" onClick={onBack}>
            Browse Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  const groups = [
    { title: "Plan", items: plans },
    { title: "Bundle", items: bundles },
    { title: "Messaging Packs", items: addons },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">Your Cart</CardTitle>
          <CardDescription>
            {items.length} item{items.length === 1 ? "" : "s"} selected
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{group.title}</span>
              <div className="flex flex-col divide-y rounded-lg border">
                {group.items.map((item) => {
                  const Icon = item.kind === "plan" ? Crown : item.kind === "bundle" ? Package : MessageSquareText
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                          <Badge variant="outline">{item.period}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.subtitle} · {formatPrice(item.price)} + {formatPrice(item.total - item.price)} GST
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold whitespace-nowrap">{formatPrice(item.total)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-muted-foreground hover:text-destructive"
                          title="Remove"
                          onClick={() => onRemove(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>

        <CardFooter>
          <Button variant="ghost" className="cursor-pointer" onClick={onBack}>
            <ArrowLeft />
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>

      <Card className="lg:sticky lg:top-4">
        <CardHeader className="border-b">
          <CardTitle className="font-semibold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SummaryRow label={`Subtotal (${items.length} item${items.length === 1 ? "" : "s"})`} value={formatPrice(totals.subtotal)} />
          <SummaryRow label="GST" value={formatPrice(totals.gst)} />
          <Separator />
          <SummaryRow label="Total Payable" value={formatPrice(totals.total)} strong />
          <Button className="mt-2 w-full cursor-pointer" size="lg" onClick={onProceed}>
            Proceed to Checkout
          </Button>
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <span>Your order is activated once the payment is verified by the Super Admin.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
