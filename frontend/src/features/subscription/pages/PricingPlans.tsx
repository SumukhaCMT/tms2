import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { Check, MessageCircle, MessageSquareText, Package, RefreshCw, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { fetchSubscriptionPlans } from "../subscriptionPlanThunks"
import {
  selectSubscriptionPlans,
  selectSubscriptionPlansError,
  selectSubscriptionPlansLoading,
} from "../subscriptionPlanSelectors"
import type { SubscriptionPlan } from "../subscriptionPlanTypes"
import { fetchSubscriptionBundles } from "@/features/subscription_bundles/subscriptionBundleThunks"
import { selectSubscriptionBundles } from "@/features/subscription_bundles/subscriptionBundleSelectors"
import type { SubscriptionBundle } from "@/features/subscription_bundles/subscriptionBundleTypes"
import {
  formatPrice,
  withGst,
  type ActiveSubscription,
  type CartItem,
  type CatalogEntry,
  type CheckoutValues,
  type ExpiredPlan,
  type ServerCartItem,
  type UpcomingPlan,
} from "../pricingCart"
import {
  addCartItem,
  apiErrorMessage,
  checkoutCart,
  discardCart,
  getActiveSubscriptions,
  getCart,
  getExpiredPlans,
  getUpcomingPlans,
  removeCartItem,
} from "../services/cartService"
import OrderSummary from "../components/pricing/OrderSummary"
import CheckoutForm from "../components/pricing/CheckoutForm"
import OrderSubmitted from "../components/pricing/OrderSubmitted"
import CartPopover from "../components/pricing/CartPopover"
import { setCartItems } from "../cartSlice"

const baseName = (plan: SubscriptionPlan) =>
  plan.plan_name.replace(/\s+(monthly|quarterly|half-yearly|annual|lifetime)$/i, "").trim()
const nameKey = (plan: SubscriptionPlan) => baseName(plan).toLowerCase()
const featuresOf = (plan: SubscriptionPlan) =>
  (plan.plan_description ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
const isAddon = (plan: SubscriptionPlan) => /sms|whatsapp/i.test(`${plan.plan_name} ${plan.plan_code}`)
const periodKey = (plan: SubscriptionPlan) => (plan.plan_type === "perpetual" ? "perpetual" : String(Number(plan.plan_duration_months ?? 1)))
const periodRank = (key: string) => (key === "perpetual" ? Number.MAX_SAFE_INTEGER : key === "bundle" ? Number.MAX_SAFE_INTEGER - 1 : Number(key))
const periodLabel = (key: string) =>
  key === "perpetual" ? "Perpetual" : key === "bundle" ? "Bundle" : key === "12" ? "Annual" : key === "1" ? "1 Month" : `${key} Months`
const validityLabel = (key: string) => (key === "perpetual" ? "Lifetime access" : `Valid for ${key === "12" ? "1 year" : periodLabel(key).toLowerCase()}`)

const toCartItem = (plan: SubscriptionPlan): CatalogEntry => ({
  id: `plan-${plan.id}`,
  kind: isAddon(plan) ? "addon" : "plan",
  plan_id: Number(plan.id),
  bundle_id: null,
  name: baseName(plan),
  subtitle: isAddon(plan) ? "Add-on" : plan.plan_code,
  period: periodLabel(periodKey(plan)),
  price: Number(plan.plan_price),
  total: Number(plan.plan_total_price),
})

const bundlePeriodKey = (bundle: SubscriptionBundle) =>
  bundle.bundle_type === "perpetual" ? "perpetual" : String(Number(bundle.bundle_duration_months ?? 1))

const bundlePlanIds = (bundle: SubscriptionBundle): number[] =>
  (typeof bundle.plan_ids === "string" ? JSON.parse(bundle.plan_ids) : (bundle.plan_ids ?? [])).map(Number)

const bundleToCart = (bundle: SubscriptionBundle): CatalogEntry => ({
  id: `bundle-${bundle.id}`,
  kind: "bundle",
  plan_id: null,
  bundle_id: Number(bundle.id),
  name: bundle.bundle_name,
  subtitle: "Bundle",
  period: periodLabel(bundlePeriodKey(bundle)),
  price: Number(bundle.bundle_price),
  total: Number(bundle.bundle_total_price),
})

interface CartActions {
  inCart: boolean
  requested: boolean
  buyLabel: string
  onAdd: () => void
  onRemove: () => void
  onBuy: () => void
}

function CartButtons({ inCart, requested, buyLabel, onAdd, onRemove, onBuy }: CartActions) {
  if (requested) {
    return (
      <Button className="min-w-36" variant="outline" disabled>
        Requested
      </Button>
    )
  }

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        variant="outline"
        className={cn("flex-1 cursor-pointer", inCart && "text-destructive hover:text-destructive")}
        onClick={inCart ? onRemove : onAdd}
      >
        {inCart ? <Trash2 /> : <ShoppingCart />}
        {inCart ? "Remove" : "Add to Cart"}
      </Button>
      <Button className="flex-1 cursor-pointer" onClick={onBuy}>
        {buyLabel}
      </Button>
    </div>
  )
}

function PlanFeature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center justify-center gap-2 text-sm">
      <Check className="size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  )
}

function PlanFeatures({ plan }: { plan: SubscriptionPlan }) {
  const features = featuresOf(plan)

  if (features.length === 0) return null

  return (
    <>
      <Separator />
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          What's included
        </span>
        <ul className="flex flex-col gap-2.5">
          {features.map((feature) => (
            <PlanFeature key={feature}>{feature}</PlanFeature>
          ))}
        </ul>
      </div>
    </>
  )
}

function PriceBlock({ plan }: { plan: SubscriptionPlan }) {
  const months = plan.plan_type === "perpetual" ? 0 : Number(plan.plan_duration_months ?? 1)

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <span className="text-4xl font-bold tracking-wide">{formatPrice(plan.plan_price)}</span>
      <span className="text-xs text-muted-foreground">
        {months > 1 ? `${formatPrice(Number(plan.plan_price) / months)} / month · ` : ""}Exclusive of GST
      </span>
    </div>
  )
}

function PlanCard({ plan, saving, isCurrent, ...actions }: { plan: SubscriptionPlan; saving: number; isCurrent: boolean } & CartActions) {
  const key = periodKey(plan)

  return (
    <Card className={cn("h-full text-center transition-all hover:-translate-y-1 hover:shadow-lg", isCurrent && "ring-2 ring-primary")}>
      <CardHeader className="justify-items-center gap-2 pt-2">
        <div className="flex h-5 items-center gap-1.5">
          {isCurrent && <Badge>Current Plan</Badge>}
          {saving > 0 && <Badge variant="secondary">Save {saving}%</Badge>}
        </div>
        <CardTitle className="text-xl font-semibold">{baseName(plan)}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center gap-5">
        <PriceBlock plan={plan} />

        <Separator />

        <ul className="flex flex-col gap-2.5">
          {Number(plan.plan_quantity) > 0 && (
            <PlanFeature>
              Up to {Number(plan.plan_quantity)} user{Number(plan.plan_quantity) === 1 ? "" : "s"}
            </PlanFeature>
          )}
          <PlanFeature>{validityLabel(key)}</PlanFeature>
          {Number(plan.plan_amc_price) > 0 && (
            <PlanFeature>
              AMC {formatPrice(withGst(Number(plan.plan_amc_price)))}
              {plan.plan_amc_duration_months ? ` every ${plan.plan_amc_duration_months} months` : ""}
            </PlanFeature>
          )}
        </ul>

        <PlanFeatures plan={plan} />
      </CardContent>

      <CardFooter className="justify-center">
        {isCurrent ? (
          <Button className="min-w-36" variant="outline" disabled>
            Current Plan
          </Button>
        ) : (
          <CartButtons {...actions} />
        )}
      </CardFooter>
    </Card>
  )
}

function AddonCard({ plan, saving, ...actions }: { plan: SubscriptionPlan; saving: number } & CartActions) {
  const Icon = /whatsapp/i.test(`${plan.plan_name} ${plan.plan_code}`) ? MessageCircle : MessageSquareText

  return (
    <Card className="h-full text-center transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="justify-items-center gap-2 pt-2">
        <div className="flex h-5 items-center gap-1.5">{saving > 0 && <Badge variant="secondary">Save {saving}%</Badge>}</div>
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-xl font-semibold">{baseName(plan)}</CardTitle>
        <CardDescription className="text-xs font-medium tracking-widest uppercase">Add-on</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center gap-5">
        <PriceBlock plan={plan} />

        <Separator />

        <ul className="flex flex-col gap-2.5">
          {Number(plan.plan_quantity) > 0 && <PlanFeature>{Number(plan.plan_quantity).toLocaleString("en-IN")} messages</PlanFeature>}
          <PlanFeature>{validityLabel(periodKey(plan))}</PlanFeature>
        </ul>

        <PlanFeatures plan={plan} />
      </CardContent>

      <CardFooter className="justify-center">
        <CartButtons {...actions} />
      </CardFooter>
    </Card>
  )
}

function BundleCard({ bundle, items, ...actions }: { bundle: SubscriptionBundle; items: SubscriptionPlan[] } & CartActions) {
  const key = bundlePeriodKey(bundle)
  const months = key === "perpetual" ? 0 : Number(bundle.bundle_duration_months ?? 1)
  const total = Number(bundle.bundle_price)
  const separate = items.reduce((sum, plan) => sum + Number(plan.plan_price), 0)
  const saving = separate > total ? Math.round((1 - total / separate) * 100) : 0
  const names = [...new Set(items.map(baseName))]
  const features = [
    ...new Set(
      items.flatMap((plan) => {
        const quantity = Number(plan.plan_quantity)
        const extra = quantity > 0 ? [isAddon(plan) ? `${quantity.toLocaleString("en-IN")} ${baseName(plan)} messages` : `Up to ${quantity} users`] : []
        return [...extra, ...featuresOf(plan)]
      }),
    ),
  ]

  return (
    <Card className="h-full text-center transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="justify-items-center gap-2 pt-2">
        <div className="flex h-5 items-center gap-1.5">{saving > 0 && <Badge variant="secondary">Save {saving}%</Badge>}</div>
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Package className="size-5" />
        </div>
        <CardTitle className="text-xl font-semibold">{bundle.bundle_name}</CardTitle>
        {names.length > 0 && <span className="text-sm font-medium text-primary">{names.join(" + ")}</span>}
        <CardDescription className="text-xs font-medium tracking-widest uppercase">{periodLabel(key)}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-2 py-3">
          <span className="text-4xl font-bold tracking-wide">{formatPrice(total)}</span>
          <span className="text-xs text-muted-foreground">
            {months > 1 ? `${formatPrice(total / months)} / month · ` : ""}Exclusive of GST
          </span>
          {saving > 0 && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(separate)} if bought separately</span>
          )}
        </div>

        <Separator />

        <ul className="flex flex-col gap-2.5">
          <PlanFeature>{validityLabel(key)}</PlanFeature>
          {Number(bundle.bundle_amc_price) > 0 && (
            <PlanFeature>
              AMC {formatPrice(withGst(Number(bundle.bundle_amc_price)))}
              {bundle.bundle_amc_duration_months ? ` every ${Number(bundle.bundle_amc_duration_months)} months` : ""}
            </PlanFeature>
          )}
        </ul>

        {features.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">What's included</span>
              <ul className="flex flex-col gap-2.5">
                {features.map((feature) => (
                  <PlanFeature key={feature}>{feature}</PlanFeature>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <CartButtons {...actions} />
      </CardFooter>
    </Card>
  )
}

function PlansSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

type Step = "plans" | "summary" | "checkout" | "submitted"

const STEPS = [
  { value: "plans", label: "Choose Plans" },
  { value: "summary", label: "Order Summary" },
  { value: "checkout", label: "Checkout" },
]

function Stepper({ step }: { step: Step }) {
  const active = STEPS.findIndex((item) => item.value === step)

  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 text-sm">
      {STEPS.map((item, index) => (
        <li key={item.value} className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full border text-xs font-medium",
              index <= active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {index < active ? <Check className="size-3.5" /> : index + 1}
          </span>
          <span className={cn(index === active ? "font-medium" : "text-muted-foreground")}>{item.label}</span>
          {index < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border" />}
        </li>
      ))}
    </ol>
  )
}

export default function PricingPlans() {
  const dispatch = useAppDispatch()
  const allPlans = useAppSelector(selectSubscriptionPlans)
  const allBundles = useAppSelector(selectSubscriptionBundles)
  const loading = useAppSelector(selectSubscriptionPlansLoading)
  const error = useAppSelector(selectSubscriptionPlansError)
  const cartRows = useAppSelector((state) => state.cart.items)
  const [searchParams, setSearchParams] = useSearchParams()
  const discard = searchParams.get("discard") === "1"
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingPlan[]>([])
  const [expired, setExpired] = useState<ExpiredPlan[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<Step>("plans")
  const [tab, setTab] = useState<string | null>(null)
  const [order, setOrder] = useState<{ reference: string; amount: number; values: CheckoutValues } | null>(null)

  useEffect(() => {
    void dispatch(fetchSubscriptionPlans())
    void dispatch(fetchSubscriptionBundles())
    getActiveSubscriptions()
      .then(setSubscriptions)
      .catch((error: unknown) => toast.error(apiErrorMessage(error)))
    getUpcomingPlans()
      .then(setUpcoming)
      .catch((error: unknown) => toast.error(apiErrorMessage(error)))
    getExpiredPlans()
      .then(setExpired)
      .catch((error: unknown) => toast.error(apiErrorMessage(error)))
  }, [dispatch])

  useEffect(() => {
    const discarded = discard
      ? discardCart().then(() => {
          toast.success("Your cart has been discarded")
          setSearchParams({}, { replace: true })
        })
      : Promise.resolve()
    discarded
      .then(getCart)
      .then((rows) => dispatch(setCartItems(rows)))
      .catch((error: unknown) => toast.error(apiErrorMessage(error)))
  }, [dispatch, discard, setSearchParams])

  const setCartRows = (rows: ServerCartItem[]) => dispatch(setCartItems(rows))

  const bundles = useMemo(
    () =>
      allBundles
        .filter((bundle) => bundle.bundle_status === "active")
        .sort((a, b) => Number(a.bundle_total_price) - Number(b.bundle_total_price)),
    [allBundles],
  )

  const planById = useMemo(() => new Map(allPlans.map((plan) => [Number(plan.id), plan])), [allPlans])

  const bundleById = useMemo(() => new Map(allBundles.map((bundle) => [Number(bundle.id), bundle])), [allBundles])

  const cart = useMemo<CartItem[]>(
    () =>
      cartRows.map((row) => {
        const plan = row.plan_id ? planById.get(row.plan_id) : undefined
        const bundle = row.bundle_id ? bundleById.get(row.bundle_id) : undefined
        const entry: CatalogEntry = plan
          ? toCartItem(plan)
          : bundle
            ? bundleToCart(bundle)
            : {
                id: row.plan_id ? `plan-${row.plan_id}` : `bundle-${row.bundle_id}`,
                kind: row.item_type,
                plan_id: row.plan_id,
                bundle_id: row.bundle_id,
                name: row.item_name,
                subtitle: row.item_code ?? "",
                period: row.license_type === "perpetual" ? "Perpetual" : "",
                price: 0,
                total: 0,
              }
        return { ...entry, cartItemId: row.id, price: row.unit_price, total: row.line_total }
      }),
    [cartRows, planById, bundleById],
  )

  const plans = useMemo(
    () =>
      allPlans
        .filter((plan) => plan.plan_status === "active")
        .sort((a, b) => Number(a.plan_total_price) - Number(b.plan_total_price)),
    [allPlans],
  )

  const periods = useMemo(
    () =>
      [...new Set([...plans.map(periodKey), ...(bundles.length > 0 ? ["bundle"] : [])])].sort(
        (a, b) => periodRank(a) - periodRank(b),
      ),
    [plans, bundles],
  )

  const monthlyRate = useMemo(
    () =>
      new Map(
        plans
          .filter((plan) => periodKey(plan) === "1")
          .map((plan) => [nameKey(plan), Number(plan.plan_total_price)]),
      ),
    [plans],
  )

  const currentPlans = subscriptions.flatMap((subscription) => {
    const plan = subscription.plan_id ? planById.get(subscription.plan_id) : undefined
    return plan && !isAddon(plan) ? [{ plan, subscription }] : []
  })
  const currentPlanIds = new Set(currentPlans.map((item) => item.plan.id))
  const activeTab = tab ?? (currentPlans[0] ? periodKey(currentPlans[0].plan) : periods[0])

  const savingOf = (plan: SubscriptionPlan) => {
    const monthly = monthlyRate.get(nameKey(plan))
    const months = Number(plan.plan_duration_months ?? 0)
    if (!monthly || plan.plan_type === "perpetual" || months <= 1) return 0
    return Math.max(0, Math.round((1 - Number(plan.plan_total_price) / (monthly * months)) * 100))
  }

  const goTo = (next: Step) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const showError = (error: unknown) => {
    toast.error(apiErrorMessage(error))
    return false
  }

  const addToCart = (item: CatalogEntry, openCart = true) => {
    const replaced = cart.filter((entry) => entry.kind === item.kind && entry.id !== item.id && entry.name.toLowerCase() === item.name.toLowerCase())
    return addCartItem({ plan_id: item.plan_id, bundle_id: item.bundle_id, replace_ids: replaced.map((entry) => entry.cartItemId) })
      .then((rows) => {
        setCartRows(rows)
        setCartOpen(openCart)
        toast.success(replaced[0] ? `${item.name} ${replaced[0].period} replaced with ${item.period}` : `${item.name} added to cart`)
        return true
      })
      .catch(showError)
  }

  const removeFromCart = (id: string) => {
    const item = cart.find((entry) => entry.id === id)
    if (!item) return
    removeCartItem(item.cartItemId)
      .then((rows) => {
        setCartRows(rows)
        toast.success(`${item.name} removed from cart`)
      })
      .catch(showError)
  }

  const requestedIds = useMemo(
    () => new Set(upcoming.map((row) => (row.plan_id ? `plan-${row.plan_id}` : `bundle-${row.bundle_id}`))),
    [upcoming],
  )

  const monthsOf = (plan: SubscriptionPlan) =>
    plan.plan_type === "perpetual" ? Number.POSITIVE_INFINITY : Number(plan.plan_duration_months ?? 0)

  const buyLabelOf = (item: CatalogEntry) => {
    const plan = item.plan_id ? planById.get(item.plan_id) : undefined
    const lapsed = plan ? expired.find((row) => Number(row.module_id) === Number(plan.module_id)) : undefined
    if (!plan || !lapsed) return "Buy Now"
    if (Number(lapsed.plan_id) === Number(plan.id)) return "Renew"
    const previous = planById.get(Number(lapsed.plan_id))
    return previous && monthsOf(plan) > monthsOf(previous) ? "Upgrade" : "Buy Now"
  }

  const actionsFor = (item: CatalogEntry): CartActions => {
    const inCart = cart.some((entry) => entry.id === item.id)
    return {
      inCart,
      requested: requestedIds.has(item.id),
      buyLabel: buyLabelOf(item),
      onAdd: () => void addToCart(item),
      onRemove: () => removeFromCart(item.id),
      onBuy: () => {
        if (inCart) return goTo("summary")
        void addToCart(item, false).then((added) => added && goTo("summary"))
      },
    }
  }

  const submitOrder = (values: CheckoutValues) => {
    setSubmitting(true)
    checkoutCart(values)
      .then((placed) => {
        setOrder({ reference: placed.order_number, amount: Number(placed.grand_total), values })
        setCartRows([])
        goTo("submitted")
        return getUpcomingPlans().then(setUpcoming)
      })
      .catch(showError)
      .finally(() => setSubmitting(false))
  }

  if (step === "submitted" && order) {
    return (
      <div className="flex w-full flex-col py-6">
        <OrderSubmitted
          reference={order.reference}
          amount={order.amount}
          values={order.values}
          onDone={() => {
            setOrder(null)
            goTo("plans")
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing Plans</h1>
        <p className="max-w-md text-sm text-muted-foreground">Choose the plan that fits your organization. Upgrade anytime.</p>
        <div className="fixed top-20 right-6 z-40">
          <CartPopover
            items={cart}
            open={cartOpen}
            onOpenChange={setCartOpen}
            onRemove={removeFromCart}
            onCheckout={() => {
              setCartOpen(false)
              goTo("summary")
            }}
          />
        </div>
      </div>

      {(cart.length > 0 || step !== "plans") && <Stepper step={step} />}

      {step === "summary" && (
        <OrderSummary
          items={cart}
          onRemove={removeFromCart}
          onBack={() => goTo("plans")}
          onProceed={() => goTo("checkout")}
        />
      )}

      {step === "checkout" && <CheckoutForm items={cart} submitting={submitting} onBack={() => goTo("summary")} onSubmit={submitOrder} />}

      {step === "plans" && (
        <>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load plans</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                {error}
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => void dispatch(fetchSubscriptionPlans())}>
                  <RefreshCw />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading && plans.length === 0 ? (
            <PlansSkeleton />
          ) : periods.length === 0 ? (
            !error && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">No plans available right now.</CardContent>
              </Card>
            )
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setTab(String(value))} className="items-center gap-6">
              <TabsList className="h-10! max-w-full overflow-x-auto">
                {periods.map((key) => (
                  <TabsTrigger key={key} value={key} className="cursor-pointer px-4">
                    {periodLabel(key)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {periods.map((key) => {
                if (key === "bundle") {
                  return (
                    <TabsContent key={key} value={key} className="w-full">
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {bundles.map((bundle) => (
                          <BundleCard
                            key={bundle.id}
                            bundle={bundle}
                            items={bundlePlanIds(bundle).flatMap((id) => planById.get(id) ?? [])}
                            {...actionsFor(bundleToCart(bundle))}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  )
                }

                const list = plans.filter((plan) => periodKey(plan) === key && !isAddon(plan))
                const packs = plans.filter((plan) => periodKey(plan) === key && isAddon(plan))

                return (
                  <TabsContent key={key} value={key} className="w-full">
                    {list.length > 0 && (
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {list.map((plan) => (
                          <PlanCard
                            key={plan.id}
                            plan={plan}
                            saving={savingOf(plan)}
                            isCurrent={currentPlanIds.has(plan.id)}
                            {...actionsFor(toCartItem(plan))}
                          />
                        ))}
                      </div>
                    )}

                    {packs.length > 0 && (
                      <div className={cn("flex flex-col items-center gap-6", list.length > 0 && "mt-12")}>
                        <div className="flex flex-col items-center gap-1 text-center">
                          <h2 className="text-xl font-semibold tracking-tight">Messaging Packs</h2>
                          <p className="text-sm text-muted-foreground">Add SMS and WhatsApp credits to any plan.</p>
                        </div>
                        <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-4">
                          {packs.map((plan) => (
                            <AddonCard key={plan.id} plan={plan} saving={savingOf(plan)} {...actionsFor(toCartItem(plan))} />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          )}

        </>
      )}
    </div>
  )
}

