import { Loader2, Check, ArrowRight } from "lucide-react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { TextField, SelectField, TextareaField, DateField, SummaryRow } from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/features/donations/shared/FormWizard"

import { IfscField, DepositedByField } from "./shared/HundiTrackingFormFields"
import { ADD_HUNDI_TRACKING_STEPS } from "./addHundiTrackingTypes"
import { useAddHundiTracking } from "./useAddHundiTracking"

export default function AddHundiTracking() {
  const {
    step,
    incompleteHundis,
    loadingHundis,
    selectedHundi,
    form,
    errors,
    submitting,
    updateForm,
    handleHundiChange,
    handleIfscResolved,
    handleDepositedByQueryChange,
    handleDepositedBySelect,
    handleNext,
    handleBack,
    handleSubmit,
  } = useAddHundiTracking()

  const entryAmount = Number(form.depositAmount) || 0

  const stepTitle = ADD_HUNDI_TRACKING_STEPS.find((definition) => definition.id === step)?.label ?? ""

  return (
    <FormWizard
      steps={ADD_HUNDI_TRACKING_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={selectedHundi ? selectedHundi.temp_name : undefined}
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
              name="hundiId"
              label="Hundi"
              required
              value={form.hundiId}
              onChange={handleHundiChange}
              options={incompleteHundis.map((hundi) => ({
                value: String(hundi.id),
                label: `${hundi.hundi_number} - ${hundi.hundi_name} (${hundi.temp_name}) · Remaining ₹${hundi.remaining_amount.toFixed(2)}`,
              }))}
              error={errors.hundiId}
              placeholder={loadingHundis ? "Loading pending hundis…" : incompleteHundis.length ? "Select a hundi" : "No pending hundis to deposit"}
              disabled={loadingHundis || !incompleteHundis.length}
            />

            <div className="grid grid-cols-3 gap-4 rounded-lg border p-3">
              <SummaryRow label="Total Cash" value={selectedHundi ? `₹${selectedHundi.total_cash.toFixed(2)}` : undefined} />
              <SummaryRow label="Deposited" value={selectedHundi ? `₹${(selectedHundi.deposited_amount + entryAmount).toFixed(2)}` : undefined} />
              <SummaryRow label="Remaining" value={selectedHundi ? `₹${(selectedHundi.remaining_amount - entryAmount).toFixed(2)}` : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DateField
              name="depositDate"
              label="Deposited Date"
              required
              value={form.depositDate}
              onChange={(value) => updateForm("depositDate", value)}
              error={errors.depositDate}
            />

            <IfscField
              value={form.ifscCode}
              onChange={(value) => updateForm("ifscCode", value)}
              onResolved={handleIfscResolved}
              error={errors.ifscCode}
            />

            <TextField
              name="bankName"
              label="Bank Name"
              required
              readOnly
              value={form.bankName}
              onChange={() => undefined}
              error={errors.bankName}
              placeholder="Resolved from the IFSC code"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              name="transactionNumber"
              label="Transaction Number"
              required
              value={form.transactionNumber}
              onChange={(value) => updateForm("transactionNumber", value)}
              error={errors.transactionNumber}
              placeholder="Bank transaction / reference number"
            />

            <TextField
              name="accountNumber"
              label="Account Number"
              required
              value={form.accountNumber}
              onChange={(value) => updateForm("accountNumber", value.replace(/[^0-9]/g, ""))}
              error={errors.accountNumber}
              inputMode="numeric"
              placeholder="e.g. 123456789012"
            />

            <TextField
              name="accountHolderName"
              label="Account Holder"
              required
              value={form.accountHolderName}
              onChange={(value) => updateForm("accountHolderName", value)}
              error={errors.accountHolderName}
              placeholder="Name on the bank account"
            />
          </div>

          <TextField
            name="depositAmount"
            label="Deposit Amount"
            required
            value={form.depositAmount}
            onChange={(value) => updateForm("depositAmount", value.replace(/[^0-9.]/g, ""))}
            error={errors.depositAmount}
            inputMode="numeric"
            placeholder="e.g. 5000"
            helperText={selectedHundi ? `Available: ₹${selectedHundi.remaining_amount.toFixed(2)}` : undefined}
          />

          <DepositedByField
            templeId={selectedHundi?.temple_id ?? null}
            value={form.depositedByQuery}
            onChange={handleDepositedByQueryChange}
            onSelect={handleDepositedBySelect}
            error={errors.depositedById}
          />

          <TextareaField
            name="remarks"
            label="Remarks"
            value={form.remarks}
            onChange={(value) => updateForm("remarks", value)}
            placeholder="Optional notes about this deposit"
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">
                {selectedHundi ? `${selectedHundi.hundi_number} - ${selectedHundi.hundi_name}` : "Hundi"}
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryRow label="Total Cash" value={selectedHundi ? `₹${selectedHundi.total_cash.toFixed(2)}` : undefined} />
              <SummaryRow label="Already Deposited" value={selectedHundi ? `₹${selectedHundi.deposited_amount.toFixed(2)}` : undefined} />
              <SummaryRow label="Remaining After Deposit" value={selectedHundi ? `₹${(selectedHundi.remaining_amount - entryAmount).toFixed(2)}` : undefined} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Bank & Deposit Details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryRow label="Deposited Date" value={form.depositDate} />
              <SummaryRow label="Bank IFSC Code" value={form.ifscCode} />
              <SummaryRow label="Bank Name" value={form.bankName} />
              <SummaryRow label="Transaction Number" value={form.transactionNumber} />
              <SummaryRow label="Account Number" value={form.accountNumber} />
              <SummaryRow label="Account Holder" value={form.accountHolderName} />
              <SummaryRow label="Deposit Amount" value={`₹${(Number(form.depositAmount) || 0).toFixed(2)}`} />
              <SummaryRow label="Deposited By" value={form.depositedByQuery} />
              <SummaryRow label="Remarks" value={form.remarks} />
            </CardContent>
          </Card>
        </div>
      )}
    </FormWizard>
  )
}
