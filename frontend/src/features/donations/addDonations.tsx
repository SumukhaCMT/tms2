import {
  Loader2,
  Check,
  Pencil,
  ArrowRight,
  FileDown,
  Printer,
  PartyPopper,
} from "lucide-react"

import { FieldSet, FieldLegend } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

import {
  TextField,
  TextareaField,
  SelectField,
  DateField,
  SummaryRow,
} from "./shared/DonationFormFields"
import { InventoryMeasurementUnitField } from "@/features/inventory/shared/InventoryFormFields"
import { FormWizard } from "./shared/FormWizard"
import {
  DONATION_TYPE_OPTIONS,
  DONATION_METHOD_OPTIONS,
  ITEM_TYPE_OPTIONS,
  INDIA_STATE_OPTIONS,
  PAN_AADHAAR_THRESHOLD,
  type DonationType,
  type DonationMethod,
  type ItemType,
} from "./shared/donationFormTypes"
import { digitsOnly, amountInWords } from "./shared/donationFormLogic"
import { ADD_DONATION_STEPS } from "./addDonationTypes"
import { DonorNameField, ReceiverNameField } from "./AddDonationAutocompleteFields"
import { useAddDonationForm } from "./useAddDonationForm"

export default function AddDonations() {
  const {
    isOrgAdmin,
    step,
    donor,
    monetary,
    inkind,
    receiver,
    errors,
    submitting,
    submittedDonation,
    receiptActionLoading,
    organizationName,
    temples,
    measurementUnits,
    templeName,
    showMonetary,
    showInkind,
    receiverIsBlank,
    updateDonor,
    updateMonetary,
    updateInkind,
    updateReceiver,
    handleSelectDonor,
    handleSelectReceiverUser,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
    handleReceiptAction,
    goToDonationsList,
  } = useAddDonationForm()

  const donationMethodLabel =
    DONATION_METHOD_OPTIONS.find((option) => option.value === monetary.donationMethod)?.label
  const itemTypeLabel = ITEM_TYPE_OPTIONS.find((option) => option.value === inkind.itemType)?.label
  const donationTypeLabel = DONATION_TYPE_OPTIONS.find(
    (option) => option.value === donor.donationType
  )?.label

  const stepTitle =
    step === 1
      ? "Donor Details"
      : step === 2
        ? donor.donationType === "both"
          ? "Donation Details (Monetary & In-Kind)"
          : donor.donationType === "inkind"
            ? "Donation Details (In-Kind)"
            : "Donation Details (Monetary)"
        : step === 3
          ? "Receiver Details"
          : "Review & Submit"

  const subtitle = `${templeName || "Temple"}${organizationName ? ` · ${organizationName}` : ""}`

  if (submittedDonation) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PartyPopper className="size-7" />
            </span>
            <div>
              <h1 className="text-xl font-semibold">Donation Recorded</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Donation Number: <span className="font-medium text-foreground">{submittedDonation.donationNumber}</span>
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleReceiptAction("download")}
                disabled={receiptActionLoading !== null}
              >
                {receiptActionLoading === "download" ? <Loader2 className="animate-spin" /> : <FileDown />}
                Download PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleReceiptAction("print")}
                disabled={receiptActionLoading !== null}
              >
                {receiptActionLoading === "print" ? <Loader2 className="animate-spin" /> : <Printer />}
                Print Receipt
              </Button>
              <Button type="button" onClick={goToDonationsList}>
                Go to Donations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <FormWizard
      steps={ADD_DONATION_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={subtitle}
      onBack={handleBack}
      backDisabled={step === 1 || submitting}
      footer={
        step < 4 ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToReview} disabled={submitting}>
              <Pencil /> Go Back & Edit
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Check />} Submit Donation
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
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                : "grid grid-cols-1 gap-4 sm:grid-cols-3"
            }
          >
            <TextField
              name="donationNumber"
              label="Donation Number"
              value={donor.donationNumber}
              onChange={() => undefined}
              readOnly
            />
            {isOrgAdmin && (
              <SelectField
                name="templeId"
                label="Temple"
                required
                value={donor.templeId}
                onChange={(value) => updateDonor("templeId", value)}
                options={temples.map((temple) => ({
                  value: String(temple.id),
                  label: temple.temp_name,
                }))}
                error={errors.templeId}
                placeholder={temples.length ? "Select temple" : "Loading temples…"}
                disabled={!temples.length}
              />
            )}
            <DonorNameField
              value={donor.donorName}
              onChange={(value) => updateDonor("donorName", value)}
              onSelectDonor={handleSelectDonor}
              error={errors.donorName}
            />
            <TextField
              name="donorPhone"
              label="Donor Phone"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={donor.donorPhone}
              onChange={(value) => updateDonor("donorPhone", digitsOnly(value).slice(0, 10))}
              error={errors.donorPhone}
              placeholder="10-digit phone number"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              name="donorEmail"
              label="Donor Email"
              type="email"
              value={donor.donorEmail}
              onChange={(value) => updateDonor("donorEmail", value)}
              error={errors.donorEmail}
              placeholder="cmt@tms.com"
            />
            <SelectField
              name="donorState"
              label="Donor State"
              required
              value={donor.donorState}
              onChange={(value) => updateDonor("donorState", value)}
              options={INDIA_STATE_OPTIONS}
              error={errors.donorState}
              placeholder="Select state"
            />
            <TextField
              name="donorCity"
              label="Donor City"
              required
              value={donor.donorCity}
              onChange={(value) => updateDonor("donorCity", value)}
              error={errors.donorCity}
              placeholder="e.g. Bengaluru"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              name="donorAddressLine1"
              label="Address Line 1"
              value={donor.donorAddressLine1}
              onChange={(value) => updateDonor("donorAddressLine1", value)}
              error={errors.donorAddressLine1}
            />
            <TextField
              name="donorAddressLine2"
              label="Address Line 2"
              value={donor.donorAddressLine2}
              onChange={(value) => updateDonor("donorAddressLine2", value)}
              error={errors.donorAddressLine2}
            />
            <TextField
              name="donorPincode"
              label="Pincode"
              required
              inputMode="numeric"
              maxLength={6}
              value={donor.donorPincode}
              onChange={(value) => updateDonor("donorPincode", digitsOnly(value).slice(0, 6))}
              error={errors.donorPincode}
              placeholder="6-digit pincode"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField
              name="donationType"
              label="Type of Donation"
              required
              value={donor.donationType}
              onChange={(value) => updateDonor("donationType", value as DonationType)}
              options={DONATION_TYPE_OPTIONS}
              error={errors.donationType}
            />
            <TextField
              name="storedAt"
              label="Stored At"
              required
              value={donor.storedAt}
              onChange={(value) => updateDonor("storedAt", value)}
              error={errors.storedAt}
              placeholder="e.g. Temple Safe, Locker A"
            />
          </div>

          <TextareaField
            name="overallRemarks"
            label="Remarks"
            value={donor.overallRemarks}
            onChange={(value) => updateDonor("overallRemarks", value)}
            error={errors.overallRemarks}
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          {showMonetary && (
            <FieldSet className="gap-4">
              {donor.donationType === "both" && (
                <FieldLegend variant="label">Monetary Details</FieldLegend>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  name="donationMethod"
                  label="Donation Method"
                  required
                  value={monetary.donationMethod}
                  onChange={(value) => updateMonetary("donationMethod", value as DonationMethod)}
                  options={DONATION_METHOD_OPTIONS}
                  error={errors.donationMethod}
                />
                <TextField
                  name="donationAmount"
                  label="Donation Amount"
                  required
                  type="number"
                  value={monetary.donationAmount}
                  onChange={(value) => updateMonetary("donationAmount", value)}
                  error={errors.donationAmount}
                  placeholder="0.00"
                  helperText={amountInWords(monetary.donationAmount) || undefined}
                />
                <TextField
                  name="bankName"
                  label="Donation Bank Name"
                  required
                  value={monetary.bankName}
                  onChange={(value) => updateMonetary("bankName", value)}
                  error={errors.bankName}
                />
                <TextField
                  name="referenceNumber"
                  label="Donation Reference Number"
                  required
                  value={monetary.referenceNumber}
                  onChange={(value) => updateMonetary("referenceNumber", value)}
                  error={errors.referenceNumber}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DateField
                  name="referenceDate"
                  label="Donation Reference Date"
                  required
                  value={monetary.referenceDate}
                  onChange={(value) => updateMonetary("referenceDate", value)}
                  error={errors.referenceDate}
                />
              </div>
              {Number(monetary.donationAmount) > PAN_AADHAAR_THRESHOLD && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    name="panNumber"
                    label="PAN Number"
                    required
                    maxLength={10}
                    value={monetary.panNumber}
                    onChange={(value) => updateMonetary("panNumber", value.toUpperCase())}
                    error={errors.panNumber}
                    placeholder="ABCDE1234F"
                    helperText="Mandatory for donations above ₹50,000"
                  />
                  <TextField
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    required
                    inputMode="numeric"
                    maxLength={12}
                    value={monetary.aadhaarNumber}
                    onChange={(value) => updateMonetary("aadhaarNumber", digitsOnly(value).slice(0, 12))}
                    error={errors.aadhaarNumber}
                    placeholder="12-digit Aadhaar number"
                    helperText="Mandatory for donations above ₹50,000"
                  />
                </div>
              )}
              <TextareaField
                name="monetaryRemarks"
                label="Remarks"
                value={monetary.monetaryRemarks}
                onChange={(value) => updateMonetary("monetaryRemarks", value)}
                error={errors.monetaryRemarks}
              />
            </FieldSet>
          )}

          {showMonetary && showInkind && <div className="h-px bg-border" />}

          {showInkind && (
            <FieldSet className="gap-4">
              {donor.donationType === "both" && (
                <FieldLegend variant="label">In-Kind Details</FieldLegend>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  name="itemType"
                  label="Item Type"
                  required
                  value={inkind.itemType}
                  onChange={(value) => updateInkind("itemType", value as ItemType)}
                  options={ITEM_TYPE_OPTIONS}
                  error={errors.itemType}
                />
                <TextField
                  name="itemTitle"
                  label="Item Title"
                  required
                  value={inkind.itemTitle}
                  onChange={(value) => updateInkind("itemTitle", value)}
                  error={errors.itemTitle}
                  placeholder="e.g. Gold, Silver, Sarees"
                />
                <TextField
                  name="measurement"
                  label="Measurement"
                  required
                  type="number"
                  value={inkind.measurement}
                  onChange={(value) => updateInkind("measurement", value)}
                  error={errors.measurement}
                  placeholder="Numbers only"
                />
                <InventoryMeasurementUnitField
                  id="measurementUnit"
                  label="Measurement Unit"
                  valueBy="name"
                  value={inkind.measurementUnit}
                  onChange={(value) => updateInkind("measurementUnit", value)}
                  units={measurementUnits}
                  error={errors.measurementUnit}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  name="quantity"
                  label="Quantity"
                  required
                  type="number"
                  value={inkind.quantity}
                  onChange={(value) => updateInkind("quantity", value)}
                  error={errors.quantity}
                  placeholder="Numbers only"
                />
                <TextField
                  name="approxMarketValue"
                  label="Approximate Market Value"
                  type="number"
                  value={inkind.approxMarketValue}
                  onChange={(value) => updateInkind("approxMarketValue", value)}
                  error={errors.approxMarketValue}
                  placeholder="Optional if estimated value is filled"
                  helperText={amountInWords(inkind.approxMarketValue) || undefined}
                />
                <TextField
                  name="estimatedValue"
                  label="Estimated Value"
                  type="number"
                  value={inkind.estimatedValue}
                  onChange={(value) => updateInkind("estimatedValue", value)}
                  error={errors.estimatedValue}
                  placeholder="Optional if market value is filled"
                  helperText={amountInWords(inkind.estimatedValue) || undefined}
                />
              </div>
              <TextareaField
                name="inkindRemarks"
                label="Remarks"
                value={inkind.inkindRemarks}
                onChange={(value) => updateInkind("inkindRemarks", value)}
                error={errors.inkindRemarks}
              />
            </FieldSet>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Every field here is optional. Leave them all blank to record yourself as the
            receiver.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReceiverNameField
              value={receiver.receiverName}
              onChange={(value) => {
                updateReceiver("receiverName", value)
                updateReceiver("receiverUserId", "")
              }}
              onSelectUser={handleSelectReceiverUser}
              error={errors.receiverName}
            />
            <TextField
              name="receiverPhone"
              label="Receiver Phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={receiver.receiverPhone}
              onChange={(value) => updateReceiver("receiverPhone", digitsOnly(value).slice(0, 10))}
              error={errors.receiverPhone}
              placeholder="10-digit phone number"
            />
            <TextField
              name="receiverDesignation"
              label="Receiver Designation"
              value={receiver.receiverDesignation}
              onChange={(value) => updateReceiver("receiverDesignation", value)}
              error={errors.receiverDesignation}
              placeholder="e.g. Trustee, Priest, Volunteer"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Donor Details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryRow label="Donation Number" value={donor.donationNumber} />
              {isOrgAdmin && <SummaryRow label="Temple" value={templeName} />}
              <SummaryRow label="Donor Name" value={donor.donorName} />
              <SummaryRow label="Donor Phone" value={donor.donorPhone} />
              <SummaryRow label="Donor Email" value={donor.donorEmail} />
              <SummaryRow label="Donor State" value={donor.donorState} />
              <SummaryRow label="Donor City" value={donor.donorCity} />
              <SummaryRow label="Address Line 1" value={donor.donorAddressLine1} />
              <SummaryRow label="Address Line 2" value={donor.donorAddressLine2} />
              <SummaryRow label="Pincode" value={donor.donorPincode} />
              <SummaryRow label="Type of Donation" value={donationTypeLabel} />
              <SummaryRow label="Stored At" value={donor.storedAt} />
              <SummaryRow label="Remarks" value={donor.overallRemarks} />
            </CardContent>
          </Card>

          {showMonetary && (
            <Card size="sm">
              <CardHeader>
                <p className="text-sm font-medium">Monetary Details</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryRow label="Donation Method" value={donationMethodLabel} />
                <SummaryRow label="Donation Amount" value={monetary.donationAmount} />
                <SummaryRow label="Amount In Words" value={amountInWords(monetary.donationAmount)} />
                <SummaryRow label="Bank Name" value={monetary.bankName} />
                <SummaryRow label="Reference Number" value={monetary.referenceNumber} />
                <SummaryRow label="Reference Date" value={monetary.referenceDate} />
                {Number(monetary.donationAmount) > PAN_AADHAAR_THRESHOLD && (
                  <>
                    <SummaryRow label="PAN Number" value={monetary.panNumber} />
                    <SummaryRow label="Aadhaar Number" value={monetary.aadhaarNumber} />
                  </>
                )}
                <SummaryRow label="Remarks" value={monetary.monetaryRemarks} />
              </CardContent>
            </Card>
          )}

          {showInkind && (
            <Card size="sm">
              <CardHeader>
                <p className="text-sm font-medium">In-Kind Details</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryRow label="Item Type" value={itemTypeLabel} />
                <SummaryRow label="Item Title" value={inkind.itemTitle} />
                <SummaryRow label="Measurement" value={inkind.measurement} />
                <SummaryRow label="Measurement Unit" value={inkind.measurementUnit} />
                <SummaryRow label="Quantity" value={inkind.quantity} />
                <SummaryRow label="Approximate Market Value" value={inkind.approxMarketValue} />
                <SummaryRow label="Approx. Value In Words" value={amountInWords(inkind.approxMarketValue)} />
                <SummaryRow label="Estimated Value" value={inkind.estimatedValue} />
                <SummaryRow label="Estimated Value In Words" value={amountInWords(inkind.estimatedValue)} />
                <SummaryRow label="Remarks" value={inkind.inkindRemarks} />
              </CardContent>
            </Card>
          )}

          <Card size="sm">
            <CardHeader>
              <p className="text-sm font-medium">Receiver Details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {receiverIsBlank ? (
                <SummaryRow label="Received By" value="You (logged-in user)" />
              ) : (
                <>
                  <SummaryRow label="Receiver Name" value={receiver.receiverName} />
                  <SummaryRow label="Receiver Phone" value={receiver.receiverPhone} />
                  <SummaryRow label="Receiver Designation" value={receiver.receiverDesignation} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </FormWizard>
  )
}
