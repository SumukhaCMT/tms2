import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  TextField,
  SelectField,
  TextareaField,
  DateField,
  SummaryRow,
} from "@/features/donations/shared/DonationFormFields"

import { InventoryMeasurementUnitField } from "./shared/InventoryFormFields"
import { itemTypePlainLabel } from "./inventoryUsageTypes"
import { useEditInventoryUsage } from "./useEditInventoryUsage"

export default function EditInventoryUsage() {
  const {
    form,
    errors,
    submitting,
    loadingRecord,
    items,
    loadingItems,
    loadingSummary,
    measurementUnits,
    liveStock,
    normalizeUsage,
    transactionNumber,
    updateForm,
    handleSubmit,
    goToUsageList,
  } = useEditInventoryUsage()

  if (loadingRecord) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/inventory/usage" />} className="mb-2 -ml-2">
          <ArrowLeft className="size-4" /> Back to Stock Usage
        </Button>
        <h2 className="text-lg font-semibold">Edit Usage Record</h2>
        <p className="text-sm text-muted-foreground">Transaction: {transactionNumber}</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <p className="text-sm font-medium">Usage Details</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SelectField
              name="itemId"
              label="Item Name"
              required
              value={form.itemId}
              onChange={(value) => updateForm("itemId", value)}
              options={items.map((item) => ({
                value: String(item.id),
                label: `${item.inventory_item_name} (${itemTypePlainLabel(item.inventory_item_type)})`,
              }))}
              error={errors.itemId}
              placeholder={loadingItems ? "Loading items…" : "Select an item"}
              disabled={loadingItems || !items.length}
            />

            <div className="grid grid-cols-3 gap-4 rounded-lg border p-3">
              <SummaryRow label="Total Stock" value={liveStock?.totalStock} />
              <SummaryRow label="Total Used" value={liveStock?.totalUsed} />
              <SummaryRow label="Remaining" value={liveStock ? liveStock.remaining : loadingSummary ? "Loading…" : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              name="usedQuantity"
              label="Quantity Used"
              required
              value={form.usedQuantity}
              onChange={(value) => updateForm("usedQuantity", value.replace(/[^0-9.]/g, ""))}
              onBlur={() => normalizeUsage()}
              error={errors.usedQuantity}
              inputMode="numeric"
              helperText={liveStock ? `Available: ${liveStock.remainingBefore}` : undefined}
            />

            <InventoryMeasurementUnitField
              value={form.usedUnit}
              onChange={(value) => {
                updateForm("usedUnit", value)
                normalizeUsage({ usedUnit: value })
              }}
              units={liveStock?.itemUnits ?? measurementUnits}
              error={errors.usedUnit}
            />

            <TextField
              name="usedMeasurement"
              label="Units Used"
              type="number"
              value={form.usedMeasurement}
              onChange={(value) => updateForm("usedMeasurement", value)}
              onBlur={() => normalizeUsage()}
              error={errors.usedMeasurement}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="usedWhere"
              label="Used At"
              required
              value={form.usedWhere}
              onChange={(value) => updateForm("usedWhere", value)}
              error={errors.usedWhere}
              placeholder="e.g. Main kitchen, Annadana hall"
            />

            <DateField
              name="usedDate"
              label="Used Date"
              required
              value={form.usedDate}
              onChange={(value) => updateForm("usedDate", value)}
              error={errors.usedDate}
            />
          </div>

          <TextareaField
            name="remarks"
            label="Remarks"
            value={form.remarks}
            onChange={(value) => updateForm("remarks", value)}
            placeholder="Optional notes about this usage"
          />
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={goToUsageList} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
