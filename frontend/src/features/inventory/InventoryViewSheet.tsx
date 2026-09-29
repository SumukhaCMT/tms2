import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatQuantity, itemTypeLabel } from "./shared/inventoryFormLogic"
import { useInventoryView } from "./useInventoryView"

interface InventoryViewSheetProps {
  inventoryId: number | null
  onClose: () => void
}

function formatDate(value: string | null, withTime = false) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  })
}

function formatMeasurement(value: number | null, unit: string | null) {
  if (value === null || value === undefined) return unit || "-"
  return `${formatQuantity(Number(value))} ${unit ?? ""}`.trim()
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{value || "-"}</div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default function InventoryViewSheet({ inventoryId, onClose }: InventoryViewSheetProps) {
  const { inventory, isLoading, totalUsed } = useInventoryView(inventoryId)

  const stock = Number(inventory?.inventory_stock_quantity) || 0
  const stockLeft = Number(inventory?.stock_left) || 0
  const usedPercent = stock > 0 ? Math.min(100, Math.round(((stock - stockLeft) / stock) * 100)) : 0

  return (
    <Sheet open={inventoryId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>{inventory ? inventory.inventory_item_name : "Inventory Details"}</SheetTitle>
          <SheetDescription>
            {inventory
              ? `${inventory.temp_name} · ${itemTypeLabel(inventory.inventory_item_type)}`
              : "Loading inventory information"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <DetailSkeleton />
        ) : !inventory ? (
          <p className="px-4 text-sm text-muted-foreground">Inventory details are not available.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Item Details</CardTitle>
                <Badge variant="secondary">{itemTypeLabel(inventory.inventory_item_type)}</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField label="Item Name" value={inventory.inventory_item_name} />
                <DetailField label="Item Code" value={inventory.inventory_item_code} />
                <DetailField label="Temple" value={inventory.temp_name} />
                <DetailField
                  label="Measurement"
                  value={formatMeasurement(inventory.inventory_measurement, inventory.unit_name)}
                />
                <DetailField label="Given By" value={inventory.inventory_given_by} />
                <DetailField label="Stored At" value={inventory.inventory_stored_at} />
                <div className="col-span-2">
                  <DetailField label="Remarks" value={inventory.remarks} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <DetailField label="Total Stock" value={formatQuantity(stock)} />
                  <DetailField label="Used" value={formatQuantity(totalUsed)} />
                  <DetailField label="Stock Left" value={formatQuantity(stockLeft)} />
                </div>
                <div className="space-y-1">
                  <Progress value={usedPercent} />
                  <p className="text-xs text-muted-foreground">{usedPercent}% of stock used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usage History</CardTitle>
                <Badge variant="outline">
                  {inventory.usages.length} {inventory.usages.length === 1 ? "record" : "records"}
                </Badge>
              </CardHeader>
              <CardContent>
                {inventory.usages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">This item has not been used yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Used Where</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>Measurement</TableHead>
                        <TableHead>Used By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.usages.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="whitespace-nowrap">{formatDate(usage.used_date)}</TableCell>
                          <TableCell className="font-medium">{usage.transaction_number}</TableCell>
                          <TableCell className="max-w-48 whitespace-normal">
                            <p>{usage.used_where}</p>
                            {usage.remarks && (
                              <p className="text-xs text-muted-foreground">{usage.remarks}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{formatQuantity(Number(usage.used_quantity))}</TableCell>
                          <TableCell>{formatMeasurement(usage.used_measurement, usage.unit_name)}</TableCell>
                          <TableCell>{usage.used_by_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Total Used</TableCell>
                        <TableCell className="text-right">{formatQuantity(totalUsed)}</TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {inventory.created_by_name && <DetailField label="Created By" value={inventory.created_by_name} />}
                <DetailField label="Created At" value={formatDate(inventory.inventory_created_at, true)} />
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
