import { Loader2, Check, ArrowRight } from "lucide-react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { TextField, SelectField, TextareaField, DateField, SummaryRow } from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/features/donations/shared/FormWizard"

import { InventoryMeasurementUnitField } from "./shared/InventoryFormFields"
import { itemTypePlainLabel } from "./inventoryUsageTypes"
import { ADD_INVENTORY_USAGE_STEPS } from "./addInventoryUsageTypes"
import { useAddInventoryUsage } from "./useAddInventoryUsage"

export default function AddInventoryUsage() {
  const {
    step,
    items,
    loadingItems,
    selectedItem,
    loadingSummary,
    measurementUnits,
    liveStock,
    normalizeUsage,
    form,
    errors,
    submitting,
    updateForm,
    handleItemChange,
    handleNext,
    handleBack,
    handleSubmit,
  } = useAddInventoryUsage()

  const stepTitle = ADD_INVENTORY_USAGE_STEPS.find((definition) => definition.id === step)?.label ?? ""

  function unitName(unitId: string) {
    return measurementUnits.find((unit) => String(unit.id) === unitId)?.unit_name ?? ""
  }

  return (
    <FormWizard
      steps={ADD_INVENTORY_USAGE_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={selectedItem ? selectedItem.inventory_item_name : undefined}
      onBack={handleBack}
      backDisabled={step === 1 || submitting}
      footer={
        step === 1 ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Check />} Submit
          </Button>
        )
      }
    >
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SelectField
              name="itemId"
              label="Item Name"
              required
              value={form.itemId}
              onChange={handleItemChange}
              options={items.map((item) => ({
                value: String(item.id),
                label: `${item.inventory_item_name} (${itemTypePlainLabel(item.inventory_item_type)})`,
              }))}
              error={errors.itemId}
              placeholder={loadingItems ? "Loading items…" : items.length ? "Select an item" : "No inventory items defined yet"}
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
              placeholder="e.g. 5"
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
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">{selectedItem ? selectedItem.inventory_item_name : "Item"}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryRow label="Total Stock" value={liveStock?.totalStock} />
              <SummaryRow label="Already Used" value={liveStock?.alreadyUsed} />
              <SummaryRow label="Remaining After Usage" value={liveStock?.remaining} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Usage Details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryRow label="Quantity Used" value={form.usedQuantity} />
              <SummaryRow label="Measurement Unit" value={unitName(form.usedUnit)} />
              <SummaryRow label="Units Used" value={form.usedMeasurement || "—"} />
              <SummaryRow label="Used At" value={form.usedWhere} />
              <SummaryRow label="Used Date" value={form.usedDate} />
              <SummaryRow label="Remarks" value={form.remarks || "—"} />
            </CardContent>
          </Card>
        </div>
      )}
    </FormWizard>
  )
}
