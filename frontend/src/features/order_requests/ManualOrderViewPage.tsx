import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { CalendarDays, IndianRupee, Package, Receipt } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailPage, DetailSection, DetailStats, DetailText } from "@/components/ui/detail-page"
import { apiErrorMessage } from "@/features/subscription/services/cartService"
import { formatPrice } from "@/features/subscription/pricingCart"

import { acceptOrderRequest, getOrderRequest, rejectOrderRequest, type OrderRequestDetails } from "./orderRequestService"

const label = (value: string | null) => (value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "")

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""

export default function ManualOrderViewPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const [order, setOrder] = useState<OrderRequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(orderId)) return
    getOrderRequest(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false))
  }, [orderId])

  function run(action: (id: number) => Promise<unknown>, message: string) {
    if (!order) return
    setBusy(true)
    action(order.id)
      .then(() => getOrderRequest(order.id))
      .then((updated) => {
        setOrder(updated)
        showCmtToast("success", message)
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error)))
      .finally(() => setBusy(false))
  }

  const address = order
    ? [order.billing_address_line1, order.billing_address_line2, order.billing_city, order.billing_state, order.billing_pincode, order.billing_country]
        .filter(Boolean)
        .join(", ")
    : ""

  return (
    <DetailPage
      title={order?.order_number ?? "Order Details"}
      description={order ? `${order.organization_name} · placed by ${order.placed_by_name}` : "Manual order details"}
      badges={
        order && (
          <>
            <Badge variant="outline">{label(order.order_status)}</Badge>
            <Badge variant="secondary">Payment {label(order.payment_status)}</Badge>
          </>
        )
      }
      actions={
        order?.order_status === "placed" && (
          <>
            <Button variant="outline" disabled={busy} onClick={() => run(rejectOrderRequest, "Order rejected")}>
              Reject
            </Button>
            <Button disabled={busy} onClick={() => run(acceptOrderRequest, "Order accepted. Subscription starts on its start date")}>
              Accept
            </Button>
          </>
        )
      }
      isLoading={isLoading}
      empty={!order && "Order details are not available."}
    >
      {order && (
        <>
          <DetailStats
            items={[
              { label: "Grand Total", value: formatPrice(order.grand_total), icon: IndianRupee },
              { label: "Subtotal", value: formatPrice(order.subtotal), icon: Receipt },
              { label: "Items", value: order.items.length, icon: Package },
              { label: "Placed On", value: formatDate(order.created_at) || "-", icon: CalendarDays },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Order"
                  fields={[
                    { label: "Organization", value: order.organization_name },
                    { label: "Placed By", value: order.placed_by_name },
                    { label: "Placed On", value: formatDate(order.created_at) },
                    { label: "Status", value: label(order.order_status) },
                  ]}
                />
                <DetailSection
                  title="Payment"
                  action={<Badge variant="secondary">{label(order.payment_status)}</Badge>}
                  fields={[
                    { label: "Method", value: label(order.payment_method) },
                    { label: "Mode", value: label(order.manual_payment_mode) },
                    { label: "Reference", value: order.manual_payment_reference },
                    { label: "Payment Date", value: formatDate(order.manual_payment_date) },
                    { label: "Currency", value: order.currency },
                    { label: "Recorded By", value: order.manual_payment_recorded_by_name },
                  ]}
                />
                <DetailSection title="Note">
                  <DetailText fallback="No note added.">{order.note}</DetailText>
                </DetailSection>
              </>
            }
          >
            <DetailSection
              title="Items"
              description="Plans and bundles included in this order"
              action={<Badge variant="outline">{order.items.length} {order.items.length === 1 ? "item" : "items"}</Badge>}
            >
              <ResizableTable
                columns={[
                  { id: "item", label: "Item", size: 14 },
                  { id: "period", label: "Period", size: 12 },
                  { id: "price", label: "Price", size: 8, className: "justify-end" },
                  { id: "gst", label: "GST", size: 8, className: "justify-end" },
                  { id: "total", label: "Total", size: 8, className: "justify-end" },
                ]}
              >
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {label(item.license_type)}
                          {item.quantity ? ` · Qty ${item.quantity}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(item.start_date)}
                        {item.end_date ? ` – ${formatDate(item.end_date)}` : " onwards"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(item.unit_price)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(item.gst_amount)}
                        <div className="text-xs text-muted-foreground">{Number(item.gst_percentage)}%</div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatPrice(item.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>Subtotal</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(order.subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4}>GST</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(order.total_gst_amount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">Grand Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatPrice(order.grand_total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </ResizableTable>
            </DetailSection>

            <DetailSection
              title="Billing"
              description="Invoice details for this order"
              fields={[
                { label: "Billing Name", value: order.billing_name },
                { label: "GST Number", value: order.billing_gst_number },
                { label: "Email", value: order.billing_email },
                { label: "Phone", value: order.billing_phone },
                { label: "Address", value: address, full: true },
              ]}
            />
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
