import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FileDown, Loader2, Plus } from "lucide-react"

import { actionHover } from "@/components/ui/action-styles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RowAction } from "@/components/row-actions"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { ListToolbar } from "@/components/ui/list-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { apiErrorMessage } from "@/features/subscription/services/cartService"
import { formatPrice } from "@/features/subscription/pricingCart"

import { downloadOrderAcknowledgement, getManualOrders, type ManualOrderRow } from "./manualOrderService"

const toLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

export default function ManualOrders() {
  const [search, setSearch] = useState("")
  const [result, setResult] = useState<{ key: string; rows: ManualOrderRow[] } | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const key = search
  const isLoading = result?.key !== key
  const rows = result?.rows ?? []

  useEffect(() => {
    getManualOrders(search)
      .then((data) => setResult({ key, rows: data }))
      .catch((error) => {
        showCmtToast("expiry", apiErrorMessage(error))
        setResult({ key, rows: [] })
      })
  }, [key, search])

  function download(row: ManualOrderRow) {
    setDownloadingId(row.id)
    downloadOrderAcknowledgement(row.id, row.order_number)
      .catch(() => showCmtToast("expiry", "Failed to download the acknowledgement. Please try again."))
      .finally(() => setDownloadingId(null))
  }

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Manual Orders"
        actions={
          <Button render={<Link to="/manual_order/add" />}>
            <Plus /> Add Manual Order
          </Button>
        }
        onSearch={setSearch}
        searchPlaceholder="Search orders..."
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching orders" : "No orders yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Orders placed or entered manually will show up here."}
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <ResizableTable
          columns={[
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "order-number", label: "Order Number", size: 10 },
            { id: "organization", label: "Organization", size: 10 },
            { id: "items", label: "Items", size: 10 },
            { id: "amount", label: "Amount", size: 10 },
            { id: "payment-method", label: "Payment Method", size: 10 },
            { id: "payment-status", label: "Payment Status", size: 10 },
            { id: "order-status", label: "Order Status", size: 10 },
            { id: "placed-by", label: "Placed By", size: 10 },
            { id: "placed-at", label: "Placed At", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{row.order_number}</TableCell>
                <TableCell>{row.organization_name}</TableCell>
                <TableCell className="max-w-48 truncate">{row.items || "—"}</TableCell>
                <TableCell>{formatPrice(row.grand_total)}</TableCell>
                <TableCell>{toLabel(row.payment_method)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{toLabel(row.payment_status)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{toLabel(row.order_status)}</Badge>
                </TableCell>
                <TableCell>{row.placed_by_name}</TableCell>
                <TableCell>{row.placed_at}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <RowAction type="view" title="View" to={`/manual_order/view/${row.id}`} />
                    <Button
                      className={actionHover.download}
                      variant="ghost"
                      size="icon"
                      title="Download Acknowledgement"
                      disabled={downloadingId === row.id}
                      onClick={() => download(row)}
                    >
                      {downloadingId === row.id ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                    </Button>
                    <RowAction type="edit" title="Edit" to={`/manual_order/edit/${row.id}`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ResizableTable>
      )}

    </div>
  )
}
