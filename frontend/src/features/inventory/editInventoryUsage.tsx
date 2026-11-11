import { ClipboardList, Loader2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
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

const EDIT_USAGE_STEPS: StepDefinition[] = [
  { id: 1, label: "Item", subLabel: "Which item was used", icon: Package },
  { id: 2, label: "Usage Details", subLabel: "Quantity, place and date", icon: ClipboardList },
]

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
    <FormWizard
      steps={EDIT_USAGE_STEPS}
      title="Edit Usage Record"
      subtitle={`Transaction: ${transactionNumber}`}
      cancelButton={
        <Button type="button" variant="outline" onClick={goToUsageList} disabled={submitting}>
          Cancel
        </Button>
      }
      submitButton={
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          Save Changes
        </Button>
      }
    >
      <FormStep step={1}>
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
      </FormStep>

      <FormStep step={2}>
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
      </FormStep>
    </FormWizard>
  )
}
