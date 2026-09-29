import { ArrowLeft, Loader2, Check, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { TextField, TextareaField, DateField, SummaryRow } from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/features/donations/shared/FormWizard"

import { IfscField, DepositedByField } from "./shared/HundiTrackingFormFields"
import { ADD_HUNDI_TRACKING_STEPS } from "./addHundiTrackingTypes"
import { useEditHundiTracking } from "./useEditHundiTracking"

export default function EditHundiTracking() {
  const {
    step,
    detail,
    loading,
    form,
    errors,
    submitting,
    updateForm,
    handleIfscResolved,
    handleDepositedByQueryChange,
    handleDepositedBySelect,
    handleNext,
    handleBack,
    handleSubmit,
  } = useEditHundiTracking()

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" size="sm" render={<Link to="/hundi/tracking" />} className="-ml-2">
          <ArrowLeft className="size-4" /> Back to Tracking
        </Button>
        <p className="text-sm text-muted-foreground">This deposit record could not be found.</p>
      </div>
    )
  }

  const otherDeposited = detail.total_cash - detail.remaining_amount
  const entryAmount = Number(form.depositAmount) || 0
  const stepTitle = ADD_HUNDI_TRACKING_STEPS.find((definition) => definition.id === step)?.label ?? ""

  return (
    <FormWizard
      steps={ADD_HUNDI_TRACKING_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={detail.temp_name}
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
            <TextField
              name="hundi"
              label="Hundi"
              readOnly
              value={`${detail.hundi_number} - ${detail.hundi_name}`}
              onChange={() => undefined}
            />

            <div className="grid grid-cols-3 gap-4 rounded-lg border p-3">
              <SummaryRow label="Total Cash" value={`₹${detail.total_cash.toFixed(2)}`} />
              <SummaryRow label="Deposited" value={`₹${(otherDeposited + entryAmount).toFixed(2)}`} />
              <SummaryRow label="Remaining" value={`₹${(detail.remaining_amount - entryAmount).toFixed(2)}`} />
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
            helperText={`Available: ₹${detail.remaining_amount.toFixed(2)}`}
          />

          <DepositedByField
            templeId={detail.temple_id}
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
              <p className="text-sm font-medium">{detail.hundi_number} - {detail.hundi_name}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryRow label="Total Cash" value={`₹${detail.total_cash.toFixed(2)}`} />
              <SummaryRow label="Other Deposits" value={`₹${otherDeposited.toFixed(2)}`} />
              <SummaryRow label="Remaining After Deposit" value={`₹${(detail.remaining_amount - entryAmount).toFixed(2)}`} />
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
