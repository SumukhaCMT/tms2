import { useState, type ReactNode } from "react"
import { cn } from "cn"
import { FileDown, Loader2, PartyPopper, Plus, Printer, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { SelectField, SummaryRow, TextareaField } from "@/features/donations/shared/DonationFormFields"
import { DateTimeField } from "@/features/hundi/shared/HundiFormFields"

import { GivenByField, InventoryItemNameField, InventoryMeasurementUnitField } from "./InventoryFormFields"
import {
  formatDateTimeDisplay,
  formatQuantity,
  itemTypeLabel,
  openInventoryReceipt,
  rowTotal,
  totalStockQuantity,
} from "./inventoryFormLogic"
import type { UnitTotal } from "./inventoryFormTypes"
import type { InventoryWizard } from "./useInventoryWizard"

function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

function UnitTotalBadges({ totals, className }: { totals: UnitTotal[]; className?: string }) {
  if (!totals.length) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {totals.map((total) => (
        <Badge key={total.unitId} variant="secondary">
          {formatQuantity(total.total)} {total.unitName}
        </Badge>
      ))}
    </div>
  )
}

export function InventoryBasicsStep({ wizard, children }: { wizard: InventoryWizard; children?: ReactNode }) {
  const { basics, errors, itemTypes, updateBasics } = wizard

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
      <GivenByField required value={basics.givenBy} onChange={(value) => updateBasics("givenBy", value)} error={errors.givenBy} />
      <DateTimeField
        name="givenAt"
        label="Given At"
        required
        value={basics.givenAt}
        onChange={(value) => updateBasics("givenAt", value)}
        error={errors.givenAt}
      />
      <SelectField
        name="itemType"
        label="Item Type"
        required
        value={basics.itemType}
        onChange={(value) => updateBasics("itemType", value as typeof basics.itemType)}
        options={itemTypes.map((type) => ({ value: type, label: itemTypeLabel(type) }))}
        error={errors.itemType}
        placeholder={itemTypes.length ? "Select item type" : "Loading…"}
        disabled={!itemTypes.length}
      />
    </div>
  )
}

export function InventoryItemsStep({ wizard }: { wizard: InventoryWizard }) {
  const { items, extras, errors, measurementUnits, totals, updateItem, applyItemSuggestion, addItem, removeItem, normalizeItemMeasurement, updateExtras, unitName } = wizard

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="min-w-52">Item Name<RequiredMark /></TableHead>
              <TableHead className="min-w-32">Stock Quantity<RequiredMark /></TableHead>
              <TableHead className="min-w-52">Stock Measurement<RequiredMark /></TableHead>
              <TableHead className="min-w-28">Units</TableHead>
              <TableHead className="min-w-32 text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="align-top pt-3.5 text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="align-top">
                  <InventoryItemNameField
                    value={row.itemName}
                    onChange={(value) => updateItem(index, "itemName", value)}
                    onSelect={(suggestion) => applyItemSuggestion(index, suggestion)}
                    error={errors[`items.${index}.itemName`]}
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Field data-invalid={!!errors[`items.${index}.stockQuantity`]}>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={row.stockQuantity}
                      placeholder="0"
                      aria-invalid={!!errors[`items.${index}.stockQuantity`]}
                      onChange={(event) => updateItem(index, "stockQuantity", event.target.value)}
                    />
                    <FieldError>{errors[`items.${index}.stockQuantity`]}</FieldError>
                  </Field>
                </TableCell>
                <TableCell className="align-top">
                  <InventoryMeasurementUnitField
                    id={`inventoryUnit-${index}`}
                    hideLabel
                    value={row.unitId}
                    onChange={(value) => {
                      updateItem(index, "unitId", value)
                      normalizeItemMeasurement(index, { unitId: value })
                    }}
                    units={measurementUnits}
                    error={errors[`items.${index}.unitId`]}
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Field data-invalid={!!errors[`items.${index}.measurement`]}>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={row.measurement}
                      placeholder="1"
                      aria-invalid={!!errors[`items.${index}.measurement`]}
                      onChange={(event) => updateItem(index, "measurement", event.target.value)}
                      onBlur={() => normalizeItemMeasurement(index)}
                    />
                    <FieldError>{errors[`items.${index}.measurement`]}</FieldError>
                  </Field>
                </TableCell>
                <TableCell className="align-top pt-3.5 text-right font-medium">
                  {formatQuantity(rowTotal(row))} {unitName(row.unitId)}
                </TableCell>
                <TableCell className="align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Remove item"
                    disabled={items.length === 1}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addItem}>
        <Plus /> Add Item
      </Button>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextareaField
          name="storedAt"
          label="Stored At"
          value={extras.storedAt}
          onChange={(value) => updateExtras("storedAt", value)}
          error={errors.storedAt}
          placeholder="e.g. Store Room 2, Shelf B"
        />
        <TextareaField
          name="remarks"
          label="Remarks"
          value={extras.remarks}
          onChange={(value) => updateExtras("remarks", value)}
          error={errors.remarks}
        />
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Final Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryRow label="Total Items" value={items.length} />
          <SummaryRow label="Total Stock Quantity" value={formatQuantity(totalStockQuantity(items))} />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Total With Measurement</span>
            <span className="text-sm font-medium">
              {totals.length ? totals.map((total) => `${formatQuantity(total.total)} ${total.unitName}`).join(", ") : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function InventorySummaryStep({ wizard, templeName }: { wizard: InventoryWizard; templeName?: string }) {
  const { basics, items, extras, totals, unitName } = wizard

  return (
    <div className="flex flex-col gap-6">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Inventory Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templeName && <SummaryRow label="Temple" value={templeName} />}
          <SummaryRow label="Given By" value={basics.givenBy} />
          <SummaryRow label="Given At" value={formatDateTimeDisplay(basics.givenAt)} />
          <SummaryRow label="Item Type" value={itemTypeLabel(basics.itemType)} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Stock Quantity</TableHead>
                  <TableHead>Stock Measurement</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{row.itemName}</TableCell>
                    <TableCell className="text-right">{formatQuantity(Number(row.stockQuantity) || 0)}</TableCell>
                    <TableCell>{unitName(row.unitId)}</TableCell>
                    <TableCell className="text-right">{row.measurement || "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatQuantity(rowTotal(row))} {unitName(row.unitId)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Final Total</TableCell>
                  <TableCell className="text-right">{formatQuantity(totalStockQuantity(items))}</TableCell>
                  <TableCell colSpan={3} className="text-right">
                    <UnitTotalBadges totals={totals} className="justify-end" />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Storage & Remarks</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SummaryRow label="Stored At" value={extras.storedAt} />
          <SummaryRow label="Remarks" value={extras.remarks} />
        </CardContent>
      </Card>
    </div>
  )
}

export function InventorySuccess({
  title,
  subtitle,
  receiptId,
  onDone,
}: {
  title: string
  subtitle: string
  receiptId: number
  onDone: () => void
}) {
  const [loading, setLoading] = useState<"download" | "print" | null>(null)

  function handleReceipt(mode: "download" | "print") {
    setLoading(mode)
    openInventoryReceipt(receiptId, mode).finally(() => setLoading(null))
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-7" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => handleReceipt("download")} disabled={loading !== null}>
            {loading === "download" ? <Loader2 className="animate-spin" /> : <FileDown />}
            Download PDF
          </Button>
          <Button type="button" variant="outline" onClick={() => handleReceipt("print")} disabled={loading !== null}>
            {loading === "print" ? <Loader2 className="animate-spin" /> : <Printer />}
            Print Receipt
          </Button>
        </div>
        <Button type="button" onClick={onDone}>
          Go to Inventory
        </Button>
      </CardContent>
    </Card>
  )
}
