import { ArrowRight, Check, Loader2, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { FormWizard } from "@/features/donations/shared/FormWizard"

import {
  InventoryBasicsStep,
  InventoryItemsStep,
  InventorySuccess,
  InventorySummaryStep,
} from "./shared/InventoryWizardSteps"
import { ADD_INVENTORY_STEPS } from "./addInventoryTypes"
import { useEditInventoryForm } from "./useEditInventoryForm"

export default function EditInventory() {
  const { wizard, loadingItem, templeName, submitting, savedId, handleSubmit, goToInventoryList } = useEditInventoryForm()

  const subtitle = templeName || "Temple"

  if (loadingItem) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (savedId) {
    return <InventorySuccess title="Inventory Updated" subtitle={subtitle} receiptId={savedId} onDone={goToInventoryList} />
  }

  return (
    <FormWizard
      steps={ADD_INVENTORY_STEPS}
      currentStep={wizard.step}
      title={`Edit ${ADD_INVENTORY_STEPS.find((definition) => definition.id === wizard.step)?.label ?? ""}`}
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
              {submitting ? <Loader2 className="animate-spin" /> : <Check />} Save Changes
            </Button>
          </div>
        )
      }
    >
      {wizard.step === 1 && <InventoryBasicsStep wizard={wizard} />}
      {wizard.step === 2 && <InventoryItemsStep wizard={wizard} />}
      {wizard.step === 3 && <InventorySummaryStep wizard={wizard} templeName={templeName} />}
    </FormWizard>
  )
}
