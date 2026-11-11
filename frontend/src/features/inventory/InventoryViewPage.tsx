import { Link, useParams } from "react-router-dom"
import { Boxes, History, PackageCheck, PackageMinus, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useModulePermissions } from "@/hooks/useModulePermissions"
import { Progress } from "@/components/ui/progress"
import { TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailMessage, DetailPage, DetailSection, DetailStats, DetailText } from "@/components/ui/detail-page"

import { formatQuantity, itemTypeLabel } from "./shared/inventoryFormLogic"
import { useInventoryView } from "./useInventoryView"

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

export default function InventoryViewPage() {
  const { id } = useParams<{ id: string }>()
  const { canEdit } = useModulePermissions("inventory")
  const inventoryId = Number(id)
  const { inventory, isLoading, totalUsed } = useInventoryView(Number.isFinite(inventoryId) ? inventoryId : null)

  const stock = Number(inventory?.inventory_stock_quantity) || 0
  const stockLeft = Number(inventory?.stock_left) || 0
  const usedPercent = stock > 0 ? Math.min(100, Math.round(((stock - stockLeft) / stock) * 100)) : 0
  const usages = inventory?.usages ?? []
  const donor = inventory?.donor ?? null
  const donorAddress = [donor?.donor_address_line1, donor?.donor_address_line2, donor?.donor_city, donor?.donor_state, donor?.donor_pincode]
    .filter(Boolean)
    .join(", ")

  return (
    <DetailPage
      title={inventory?.inventory_item_name ?? "Inventory Details"}
      description={inventory ? `${inventory.temp_name} · ${itemTypeLabel(inventory.inventory_item_type)}` : "Inventory record details"}
      badges={
        inventory && (
          <>
            <Badge variant="secondary">{itemTypeLabel(inventory.inventory_item_type)}</Badge>
            <Badge variant={stockLeft > 0 ? "default" : "destructive"}>{stockLeft > 0 ? "In Stock" : "Out of Stock"}</Badge>
          </>
        )
      }
      actions={
        inventory &&
        canEdit && (
          <Button render={<Link to={`/inventory/edit/${inventory.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={isLoading}
      empty={!inventory && "Inventory details are not available."}
    >
      {inventory && (
        <>
          <DetailStats
            items={[
              { label: "Total Stock", value: formatQuantity(stock), icon: Boxes },
              { label: "Used", value: formatQuantity(totalUsed), icon: PackageMinus, hint: `${usedPercent}% of stock` },
              { label: "Stock Left", value: formatQuantity(stockLeft), icon: PackageCheck },
              { label: "Usage Records", value: usages.length, icon: History },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Item Details"
                  fields={[
                    { label: "Item Name", value: inventory.inventory_item_name },
                    { label: "Temple", value: inventory.temp_name },
                    { label: "Measurement", value: formatMeasurement(inventory.inventory_measurement, inventory.unit_name) },
                    { label: "Stored at", value: inventory.inventory_stored_at },
                  ]}
                />
                <DetailSection title="Remarks">
                  <DetailText fallback="No remarks added.">{inventory.remarks}</DetailText>
                </DetailSection>
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created By", value: inventory.created_by_name, hidden: !inventory.created_by_name },
                    { label: "Created At", value: formatDate(inventory.inventory_created_at, true) },
                  ]}
                />
              </>
            }
          >
            <DetailSection
              title="Given By"
              description={donor ? "Contact information of the donor" : "Person who donated the item"}
              action={
                donor && (
                  <Badge variant="outline" render={<Link to={`/donations/view/${donor.id}`} />}>
                    From donation {donor.donation_number}
                  </Badge>
                )
              }
              fields={[
                { label: "Donor Name", value: donor?.donor_name ?? inventory.inventory_given_by },
                { label: "Phone", value: donor?.donor_phone, hidden: !donor },
                { label: "Email", value: donor?.donor_email, hidden: !donor },
                { label: "Temple", value: inventory.temp_name },
                { label: "Address", value: donorAddress, full: true, hidden: !donor },
              ]}
            />

            <DetailSection
              title="Stock Overview"
              description={`${formatQuantity(stockLeft)} of ${formatQuantity(stock)} remaining`}
              action={<Badge variant="outline">{usedPercent}% used</Badge>}
            >
              <Progress value={usedPercent} />
            </DetailSection>

            <DetailSection
              title="Usage History"
              description="Where and when this item was used"
              action={<Badge variant="outline">{usages.length} {usages.length === 1 ? "record" : "records"}</Badge>}
            >
              {usages.length === 0 ? (
                <DetailMessage>This item has not been used yet.</DetailMessage>
              ) : (
                <ResizableTable
                  columns={[
                    { id: "date", label: "Date", size: 10 },
                    { id: "transaction", label: "Transaction", size: 10 },
                    { id: "used-where", label: "Used Where", size: 10 },
                    { id: "qty", label: "Qty", size: 10, className: "justify-end" },
                    { id: "measurement", label: "Measurement", size: 10 },
                    { id: "used-by", label: "Used By", size: 10 },
                  ]}
                >
                  <TableBody>
                    {usages.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(usage.used_date)}</TableCell>
                        <TableCell><Badge variant="secondary">{usage.transaction_number}</Badge></TableCell>
                        <TableCell className="max-w-48 whitespace-normal">
                          <p>{usage.used_where}</p>
                          {usage.remarks && <p className="text-xs text-muted-foreground">{usage.remarks}</p>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatQuantity(Number(usage.used_quantity))}</TableCell>
                        <TableCell>{formatMeasurement(usage.used_measurement, usage.unit_name)}</TableCell>
                        <TableCell>{usage.used_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Total Used</TableCell>
                      <TableCell className="text-right tabular-nums">{formatQuantity(totalUsed)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableFooter>
                </ResizableTable>
              )}
            </DetailSection>
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
