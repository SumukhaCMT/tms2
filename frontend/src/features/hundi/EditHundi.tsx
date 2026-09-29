import { useRef } from "react"
import { ArrowRight, Pencil, Loader2, Check, Plus, Trash2, ImagePlus } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { FieldSet, FieldLegend, Field, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import {
  TextField,
  TextareaField,
  SelectField,
  SummaryRow,
} from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/features/donations/shared/FormWizard"
import { InventoryMeasurementUnitField } from "@/features/inventory/shared/InventoryFormFields"
import { hundiItemTotal, hundiMeasurementTotals } from "./shared/hundiMeasurement"

import { WitnessDetailsFields, WitnessSummaryCard } from "./shared/WitnessDetailsFields"
import { DeityMultiSelectField, DateTimeField } from "./shared/HundiFormFields"
import {
  denominationLineTotal,
  denominationsSubtotal,
  denominationsGrandTotal,
  amountInWords,
  formatOpenedAtDisplay,
} from "./shared/hundiFormLogic"
import { EDIT_HUNDI_STEPS } from "./editHundiTypes"
import { useEditHundiForm } from "./useEditHundiForm"

export default function EditHundi() {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const {
    isOrgAdmin,
    step,
    basic,
    witnessList,
    denominations,
    items,
    generalRemark,
    errors,
    submitting,
    loadingHundi,
    organizationName,
    temples,
    deities,
    measurementUnits,
    templeName,
    hundiNumber,
    hundiName,
    imagePreviewUrl,
    uploadingImage,
    handleUploadImage,
    setGeneralRemark,
    updateItem,
    addItem,
    normalizeItemMeasurement,
    removeItem,
    updateDenominationQuantity,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
  } = useEditHundiForm()

  const stepTitle = EDIT_HUNDI_STEPS.find((definition) => definition.id === step)?.label ?? ""
  const subtitle = `${templeName || "Temple"}${organizationName ? ` · ${organizationName}` : ""}`

  const noteTotal = denominationsSubtotal(denominations, "note")
  const coinTotal = denominationsSubtotal(denominations, "coin")
  const grandTotal = denominationsGrandTotal(denominations)

  const selectedDeityNames = deities.map((deity) => deity.name).join(", ")

  if (loadingHundi) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <FormWizard
      steps={EDIT_HUNDI_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={subtitle}
      onBack={handleBack}
      backDisabled={step === 1 || submitting}
      footer={
        step < 6 ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToReview} disabled={submitting}>
              <Pencil /> Go Back & Edit
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Check />} Update Hundi
            </Button>
          </div>
        )
      }
    >
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Basic Details are fixed once a hundi is opened and cannot be changed here.
          </p>
          <div
            className={
              isOrgAdmin
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            <TextField
              name="hundiNumber"
              label="Hundi"
              value={`${hundiNumber} - ${hundiName}`}
              onChange={() => undefined}
              readOnly
            />
            <DateTimeField
              name="openedAt"
              label="Opened At"
              value={basic.openedAt}
              onChange={() => undefined}
              disabled
            />
            {isOrgAdmin && (
              <SelectField
                name="templeId"
                label="Temple"
                value={basic.templeId}
                onChange={() => undefined}
                options={temples.map((temple) => ({ value: String(temple.id), label: temple.temp_name }))}
                disabled
              />
            )}
            <DeityMultiSelectField
              value={basic.deityIds}
              onChange={() => undefined}
              deities={deities}
              disabled
            />
          </div>
        </div>
      )}

      {step === 2 && <WitnessDetailsFields list={witnessList} />}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <FieldSet className="gap-3">
            <FieldLegend variant="label">Notes</FieldLegend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {denominations
                .filter((row) => row.type === "note")
                .map((row) => (
                  <div key={row.id} className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">₹{row.value}</label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(event) => updateDenominationQuantity(row.id, event.target.value)}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                    />
                    <span className="text-xs text-muted-foreground">= ₹{denominationLineTotal(row).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </FieldSet>

          <FieldSet className="gap-3">
            <FieldLegend variant="label">Coins</FieldLegend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {denominations
                .filter((row) => row.type === "coin")
                .map((row) => (
                  <div key={row.id} className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">₹{row.value}</label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(event) => updateDenominationQuantity(row.id, event.target.value)}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                    />
                    <span className="text-xs text-muted-foreground">= ₹{denominationLineTotal(row).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </FieldSet>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryRow label="Notes Total" value={`₹${noteTotal.toFixed(2)}`} />
            <SummaryRow label="Coins Total" value={`₹${coinTotal.toFixed(2)}`} />
            <SummaryRow label="Grand Total" value={`₹${grandTotal.toFixed(2)}`} />
          </div>
          {grandTotal > 0 && (
            <p className="text-sm text-muted-foreground">{amountInWords(String(grandTotal))}</p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Optional — leave the item name blank if no other items were found in the hundi.
          </p>
          {items.map((row, index) => (
            <div key={index} className="flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Item {index + 1}</p>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  name={`itemName-${index}`}
                  label="Item Name"
                  value={row.itemName}
                  onChange={(value) => updateItem(index, "itemName", value)}
                  error={errors[`items.${index}.itemName`]}
                  placeholder="e.g. Gold ring, Silver coin"
                />
                <TextField
                  name={`measurementWeight-${index}`}
                  label="Measurement Weight"
                  type="number"
                  value={row.measurementWeight}
                  onChange={(value) => updateItem(index, "measurementWeight", value)}
                  onBlur={() => normalizeItemMeasurement(index)}
                  error={errors[`items.${index}.measurementWeight`]}
                />
                <InventoryMeasurementUnitField
                  id={`measurement-${index}`}
                  label="Measurement"
                  required={false}
                  valueBy="name"
                  value={row.measurement}
                  onChange={(value) => {
                    updateItem(index, "measurement", value)
                    normalizeItemMeasurement(index, { measurement: value })
                  }}
                  units={measurementUnits}
                  error={errors[`items.${index}.measurement`]}
                />
                <TextField
                  name={`quantity-${index}`}
                  label="Quantity"
                  type="number"
                  inputMode="numeric"
                  value={row.quantity}
                  onChange={(value) => updateItem(index, "quantity", value)}
                  error={errors[`items.${index}.quantity`]}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  name={`approximateValue-${index}`}
                  label="Approximate Value"
                  type="number"
                  value={row.approximateValue}
                  onChange={(value) => updateItem(index, "approximateValue", value)}
                  error={errors[`items.${index}.approximateValue`]}
                  helperText={amountInWords(row.approximateValue) || undefined}
                  disabled={row.exactValue.trim() !== ""}
                />
                <TextField
                  name={`exactValue-${index}`}
                  label="Exact Value"
                  type="number"
                  value={row.exactValue}
                  onChange={(value) => updateItem(index, "exactValue", value)}
                  error={errors[`items.${index}.exactValue`]}
                  helperText={amountInWords(row.exactValue) || undefined}
                  disabled={row.approximateValue.trim() !== ""}
                />
              </div>
              {hundiItemTotal(row, measurementUnits) && (
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{hundiItemTotal(row, measurementUnits)}</span>
                </p>
              )}
            </div>
          ))}
          {hundiMeasurementTotals(items, measurementUnits).length > 0 && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-3">
              {hundiMeasurementTotals(items, measurementUnits).map((total) => (
                <SummaryRow key={total.measurementName} label={`Total ${total.measurementName}`} value={total.total} />
              ))}
            </div>
          )}
          <Button type="button" variant="outline" size="sm" className="w-fit gap-2" onClick={addItem}>
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Hundi Image</FieldLabel>
            {imagePreviewUrl && (
              <img src={imagePreviewUrl} alt="Hundi" className="h-40 w-40 rounded-lg border object-cover" />
            )}
            {!imagePreviewUrl && (
              <p className="text-sm text-muted-foreground">No photo was uploaded for this hundi.</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-2"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {imagePreviewUrl ? "Replace Photo" : "Upload Photo"}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleUploadImage(file)
                event.target.value = ""
              }}
            />
          </Field>
        </div>
      )}

      {step === 6 && (
        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Basic Details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryRow label="Opened At" value={formatOpenedAtDisplay(basic.openedAt)} />
              {isOrgAdmin && <SummaryRow label="Temple" value={templeName} />}
              <SummaryRow label="Deities" value={selectedDeityNames} />
            </CardContent>
          </Card>

          <WitnessSummaryCard witnesses={witnessList.witnesses} />

          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Cash Denominations</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryRow label="Notes Total" value={`₹${noteTotal.toFixed(2)}`} />
              <SummaryRow label="Coins Total" value={`₹${coinTotal.toFixed(2)}`} />
              <SummaryRow label="Grand Total" value={`₹${grandTotal.toFixed(2)}`} />
            </CardContent>
          </Card>

          {items.some((row) => row.itemName.trim()) && (
            <Card size="sm">
              <CardHeader>
                <p className="text-sm font-medium">Physical Items</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {items
                  .filter((row) => row.itemName.trim())
                  .map((row, index) => (
                    <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <SummaryRow label="Item Name" value={row.itemName} />
                      <SummaryRow label="Quantity" value={row.quantity} />
                      <SummaryRow label="Measurement Weight" value={row.measurementWeight} />
                      <SummaryRow label="Measurement" value={row.measurement} />
                      <SummaryRow label="Approximate Value" value={row.approximateValue} />
                      <SummaryRow label="Exact Value" value={row.exactValue} />
                      <SummaryRow label="Total" value={hundiItemTotal(row, measurementUnits) ?? undefined} />
                    </div>
                  ))}
                {hundiMeasurementTotals(items, measurementUnits).length > 0 && (
                  <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
                    {hundiMeasurementTotals(items, measurementUnits).map((total) => (
                      <SummaryRow key={total.measurementName} label={`Total ${total.measurementName}`} value={total.total} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <TextareaField
            name="generalRemark"
            label="General Remark"
            value={generalRemark}
            onChange={setGeneralRemark}
          />
        </div>
      )}
    </FormWizard>
  )
}
