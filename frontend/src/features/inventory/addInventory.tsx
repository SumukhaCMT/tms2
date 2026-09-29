import { ArrowRight, Check, Loader2, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"

import { SelectField } from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/features/donations/shared/FormWizard"

import {
  InventoryBasicsStep,
  InventoryItemsStep,
  InventorySuccess,
  InventorySummaryStep,
} from "./shared/InventoryWizardSteps"
import { ADD_INVENTORY_STEPS } from "./addInventoryTypes"
import { useAddInventoryForm } from "./useAddInventoryForm"

export default function AddInventory() {
  const {
    wizard,
    isOrgAdmin,
    templeId,
    setTempleId,
    temples,
    templeName,
    submitting,
    createdId,
    handleSubmit,
    goToInventoryList,
  } = useAddInventoryForm()

  const subtitle = templeName || "Temple"

  if (createdId) {
    return (
      <InventorySuccess
        title={wizard.items.length > 1 ? "Inventory Items Added" : "Inventory Item Added"}
        subtitle={subtitle}
        receiptId={createdId}
        onDone={goToInventoryList}
      />
    )
  }

  return (
    <FormWizard
      steps={ADD_INVENTORY_STEPS}
      currentStep={wizard.step}
      title={ADD_INVENTORY_STEPS.find((definition) => definition.id === wizard.step)?.label ?? ""}
      subtitle={subtitle}
      onBack={wizard.handleBack}
      backDisabled={wizard.step === 1 || submitting}
      footer={
        wizard.step < 3 ? (
          <Button type="button" onClick={wizard.handleNext}>
            Next <ArrowRight />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => wizard.setStep(2)} disabled={submitting}>
              <Pencil /> Go Back & Edit
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Check />} Submit
            </Button>
          </div>
        )
      }
    >
      {wizard.step === 1 && (
        <InventoryBasicsStep wizard={wizard}>
          {isOrgAdmin && (
            <SelectField
              name="templeId"
              label="Temple"
              required
              value={templeId}
              onChange={setTempleId}
              options={temples.map((temple) => ({ value: String(temple.id), label: temple.temp_name }))}
              error={wizard.errors.templeId}
              placeholder={temples.length ? "Select temple" : "Loading temples…"}
              disabled={!temples.length}
            />
          )}
        </InventoryBasicsStep>
      )}
      {wizard.step === 2 && <InventoryItemsStep wizard={wizard} />}
      {wizard.step === 3 && <InventorySummaryStep wizard={wizard} templeName={isOrgAdmin ? templeName : undefined} />}
    </FormWizard>
  )
}
