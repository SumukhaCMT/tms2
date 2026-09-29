import { useRef } from "react"
import { Loader2, Check, Pencil, ArrowRight, FileDown, Printer, PartyPopper, Upload, Plus, Trash2 } from "lucide-react"

import { FieldSet, FieldLegend } from "@/components/ui/field"
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
import { DeityMultiSelectField, ImageField, DateTimeField } from "./shared/HundiFormFields"
import {
  denominationLineTotal,
  denominationsSubtotal,
  denominationsGrandTotal,
  amountInWords,
  formatOpenedAtDisplay,
} from "./shared/hundiFormLogic"
import { ADD_HUNDI_STEPS } from "./addHundiTypes"
import { useAddHundiForm } from "./useAddHundiForm"

export default function AddHundi() {
  const {
    isOrgAdmin,
    step,
    basic,
    witnessList,
    denominations,
    items,
    image,
    generalRemark,
    errors,
    submitting,
    createdHundis,
    receiptActionLoading,
    uploadingSignedId,
    signedUploadedIds,
    organizationName,
    temples,
    deities,
    measurementUnits,
    templeName,
    setImage,
    setGeneralRemark,
    updateBasic,
    updateItem,
    addItem,
    normalizeItemMeasurement,
    removeItem,
    updateDenominationQuantity,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
    handleReceiptAction,
    handleUploadSignedReceipt,
    goToHundiList,
  } = useAddHundiForm()

  const signedReceiptInputRef = useRef<HTMLInputElement>(null)
  const pendingSignedUploadId = useRef<number | null>(null)

  function triggerSignedUpload(hundiId: number) {
    pendingSignedUploadId.current = hundiId
    signedReceiptInputRef.current?.click()
  }

  const stepTitle = ADD_HUNDI_STEPS.find((definition) => definition.id === step)?.label ?? ""
  const subtitle = `${templeName || "Temple"}${organizationName ? ` · ${organizationName}` : ""}`

  const noteTotal = denominationsSubtotal(denominations, "note")
  const coinTotal = denominationsSubtotal(denominations, "coin")
  const grandTotal = denominationsGrandTotal(denominations)

  const selectedDeityNames = deities
    .filter((deity) => basic.deityIds.includes(String(deity.id)))
    .map((deity) => deity.name)
    .join(", ")

  if (createdHundis) {
    const single = createdHundis.length === 1 ? createdHundis[0] : null

    return (
      <div className="flex w-full flex-col gap-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PartyPopper className="size-7" />
            </span>
            <div>
              <h1 className="text-xl font-semibold">
                {createdHundis.length > 1 ? "Hundis Opened" : "Hundi Opened"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              {single && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Hundi Number: <span className="font-medium text-foreground">{single.hundi_number} - {single.hundi_name}</span>
                </p>
              )}
            </div>

            {single ? (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReceiptAction(single.id, "download")}
                  disabled={receiptActionLoading !== null}
                >
                  {receiptActionLoading === `${single.id}-download` ? <Loader2 className="animate-spin" /> : <FileDown />}
                  Download PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReceiptAction(single.id, "print")}
                  disabled={receiptActionLoading !== null}
                >
                  {receiptActionLoading === `${single.id}-print` ? <Loader2 className="animate-spin" /> : <Printer />}
                  Print Receipt
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => triggerSignedUpload(single.id)}
                  disabled={uploadingSignedId !== null || signedUploadedIds.includes(single.id)}
                >
                  {uploadingSignedId === single.id ? <Loader2 className="animate-spin" /> : <Upload />}
                  {signedUploadedIds.includes(single.id) ? "Signed PDF Uploaded" : "Upload Signed PDF"}
                </Button>
                <Button type="button" onClick={goToHundiList}>
                  Go to Hundi
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-2 flex w-full max-w-md flex-col gap-3">
                  {createdHundis.map((hundi) => (
                    <div key={hundi.id} className="flex flex-col gap-2 rounded-lg border p-3 text-left">
                      <div>
                        <p className="text-sm font-medium">{hundi.hundi_number} - {hundi.hundi_name}</p>
                        <p className="text-xs text-muted-foreground">{hundi.deity_name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleReceiptAction(hundi.id, "download")}
                          disabled={receiptActionLoading !== null}
                        >
                          {receiptActionLoading === `${hundi.id}-download` ? <Loader2 className="animate-spin" /> : <FileDown />}
                          Download PDF
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleReceiptAction(hundi.id, "print")}
                          disabled={receiptActionLoading !== null}
                        >
                          {receiptActionLoading === `${hundi.id}-print` ? <Loader2 className="animate-spin" /> : <Printer />}
                          Print Receipt
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => triggerSignedUpload(hundi.id)}
                          disabled={uploadingSignedId !== null || signedUploadedIds.includes(hundi.id)}
                        >
                          {uploadingSignedId === hundi.id ? <Loader2 className="animate-spin" /> : <Upload />}
                          {signedUploadedIds.includes(hundi.id) ? "Signed PDF Uploaded" : "Upload Signed PDF"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="button" onClick={goToHundiList}>
                  Go to Hundi
                </Button>
              </>
            )}

            <input
              ref={signedReceiptInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                const hundiId = pendingSignedUploadId.current
                if (file && hundiId) handleUploadSignedReceipt(hundiId, file)
                event.target.value = ""
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <FormWizard
      steps={ADD_HUNDI_STEPS}
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
              {submitting ? <Loader2 className="animate-spin" /> : <Check />} Submit
            </Button>
          </div>
        )
      }
    >
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div
            className={
              isOrgAdmin
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            <DateTimeField
              name="openedAt"
              label="Opened At"
              required
              value={basic.openedAt}
              onChange={(value) => updateBasic("openedAt", value)}
              error={errors.openedAt}
            />
            {isOrgAdmin && (
              <SelectField
                name="templeId"
                label="Temple"
                required
                value={basic.templeId}
                onChange={(value) => updateBasic("templeId", value)}
                options={temples.map((temple) => ({ value: String(temple.id), label: temple.temp_name }))}
                error={errors.templeId}
                placeholder={temples.length ? "Select temple" : "Loading temples…"}
                disabled={!temples.length}
              />
            )}
            <DeityMultiSelectField
              value={basic.deityIds}
              onChange={(value) => updateBasic("deityIds", value)}
              deities={deities}
              error={errors.deityIds}
              disabled={isOrgAdmin && !basic.templeId}
            />
          </div>
        </div>
      )}

      {step === 2 && <WitnessDetailsFields list={witnessList} />}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          {denominations.length === 0 && (
            <p className="text-sm text-muted-foreground">Loading denominations…</p>
          )}

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
          <ImageField value={image} onChange={setImage} />
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
