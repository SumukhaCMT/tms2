import { useEffect, useState, type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { getOrderRequest, type OrderRequestDetails } from "@/features/order_requests/orderRequestService"
import { formatPrice } from "@/features/subscription/pricingCart"

const label = (value: string | null) => (value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "")

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""

function DetailField({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="text-sm font-medium break-words">{value || "-"}</div>
    </div>
  )
}

interface OrderRequestSheetProps {
  orderId: number
  busy: boolean
  onClose: () => void
  onAccept: (id: number) => void
  onReject: (id: number) => void
}

export default function OrderRequestSheet({ orderId, busy, onClose, onAccept, onReject }: OrderRequestSheetProps) {
  const [order, setOrder] = useState<OrderRequestDetails | null>(null)

  useEffect(() => {
    getOrderRequest(orderId).then(setOrder)
  }, [orderId])

  const address = order
    ? [order.billing_address_line1, order.billing_address_line2, order.billing_city, order.billing_state, order.billing_pincode, order.billing_country]
        .filter(Boolean)
        .join(", ")
    : ""

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>{order ? order.order_number : "Order Request"}</SheetTitle>
          <SheetDescription>{order ? `${order.organization_name} · placed by ${order.placed_by_name}` : "Loading order details"}</SheetDescription>
        </SheetHeader>

        {!order ? (
          <div className="space-y-4 px-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{label(order.order_status)}</Badge>
                  <Badge variant="secondary">Payment {label(order.payment_status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField title="Organization" value={order.organization_name} />
                <DetailField title="Placed By" value={order.placed_by_name} />
                <DetailField title="Placed On" value={formatDate(order.created_at)} />
                <DetailField title="Note" value={order.note} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField title="Method" value={label(order.payment_method)} />
                <DetailField title="Mode" value={label(order.manual_payment_mode)} />
                <DetailField title="Reference" value={order.manual_payment_reference} />
                <DetailField title="Payment Date" value={formatDate(order.manual_payment_date)} />
                <DetailField title="Recorded By" value={order.manual_payment_recorded_by_name} />
                <DetailField title="Currency" value={order.currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResizableTable
                  columns={[
                    { id: "item", label: "Item", size: 10 },
                    { id: "period", label: "Period", size: 10 },
                    { id: "price", label: "Price", size: 10, className: "justify-end" },
                    { id: "gst", label: "GST", size: 10, className: "justify-end" },
                    { id: "total", label: "Total", size: 10, className: "justify-end" },
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
                        <TableCell className="text-xs">
                          {formatDate(item.start_date)}
                          {item.end_date ? ` – ${formatDate(item.end_date)}` : " onwards"}
                          {item.amc_start_date && item.amc_end_date && (
                            <div className="text-muted-foreground">
                              AMC: {formatDate(item.amc_start_date)} – {formatDate(item.amc_end_date)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.gst_amount)}
                          <div className="text-xs text-muted-foreground">{Number(item.gst_percentage)}%</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(item.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ResizableTable>
                <div className="ml-auto flex w-56 flex-col gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST</span>
                    <span>{formatPrice(order.total_gst_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Grand Total</span>
                    <span>{formatPrice(order.grand_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField title="Billing Name" value={order.billing_name} />
                <DetailField title="GST Number" value={order.billing_gst_number} />
                <DetailField title="Email" value={order.billing_email} />
                <DetailField title="Phone" value={order.billing_phone} />
                <div className="col-span-2">
                  <DetailField title="Address" value={address} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {order?.order_status === "placed" && (
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button variant="outline" disabled={busy} onClick={() => onReject(order.id)}>
              Reject
            </Button>
            <Button disabled={busy} onClick={() => onAccept(order.id)}>
              Accept
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
