import { useCallback, useEffect, useState } from "react"
import { Bell, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import OrderRequestSheet from "@/components/layout/OrderRequestSheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { acceptOrderRequest, getOrderRequests, rejectOrderRequest, type OrderRequest } from "@/features/order_requests/orderRequestService"
import { apiErrorMessage } from "@/features/subscription/services/cartService"
import { formatPrice } from "@/features/subscription/pricingCart"

export default function OrderNotifications() {
  const [orders, setOrders] = useState<OrderRequest[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)
  const [viewId, setViewId] = useState<number | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)

  const load = useCallback(() => getOrderRequests().then(setOrders), [])

  useEffect(() => {
    getOrderRequests().then(setOrders)
  }, [])

  const run = (id: number, request: (id: number) => Promise<unknown>, message: string) => {
    setBusyId(id)
    request(id)
      .then(() => {
        setOrders((current) => current.filter((order) => order.id !== id))
        setViewId(null)
        setRejectId(null)
        toast.success(message)
      })
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => setBusyId(null))
  }

  const accept = (id: number) => run(id, acceptOrderRequest, "Order accepted. Subscription starts on its start date")
  const reject = (id: number) => run(id, rejectOrderRequest, "Order rejected")

  return (
    <>
      <Popover onOpenChange={(open) => open && load()}>
        <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
          <Bell />
          {orders.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {orders.length}
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-semibold">Order Requests</span>
            <Button size="sm" variant="outline" render={<Link to="/manual_order/add" />}>
              <Plus /> Manual Order
            </Button>
          </div>
          <Separator />
          {orders.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No pending orders</p>
          ) : (
            <ul className="max-h-96 divide-y overflow-y-auto">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{order.organization_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.order_number} · by {order.placed_by_name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(order.grand_total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{order.items}</p>
                  {order.manual_payment_reference && (
                    <p className="text-xs text-muted-foreground">
                      {order.manual_payment_mode?.toUpperCase()} · {order.manual_payment_reference}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setViewId(order.id)}>
                      View
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === order.id} onClick={() => setRejectId(order.id)}>
                      Reject
                    </Button>
                    <Button size="sm" disabled={busyId === order.id} onClick={() => accept(order.id)}>
                      {busyId === order.id ? "Saving..." : "Accept"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {viewId !== null && (
        <OrderRequestSheet
          key={viewId}
          orderId={viewId}
          busy={busyId === viewId}
          onClose={() => setViewId(null)}
          onAccept={accept}
          onReject={setRejectId}
        />
      )}

      <AlertDialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this order?</AlertDialogTitle>
            <AlertDialogDescription>The order will be cancelled and no subscription will be activated.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={busyId !== null} onClick={() => rejectId !== null && reject(rejectId)}>
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
