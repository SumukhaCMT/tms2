import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SummaryRow, TextareaField, TextField } from "@/features/donations/shared/DonationFormFields"

import type { WitnessDetailsForm } from "./hundiFormTypes"
import { digitsOnly } from "./hundiFormLogic"
import type { WitnessList } from "./useWitnessList"
import { WitnessNameField } from "./WitnessNameField"

export function WitnessDetailsFields({ list }: { list: WitnessList }) {
  const { witnesses, errors, update, select, add, remove } = list

  return (
    <div className="flex flex-col gap-4">
      {witnesses.map((witness, index) => {
        const error = (field: keyof WitnessDetailsForm) => errors[`${index}.${field}`]
        const change = (field: keyof WitnessDetailsForm) => (value: string) => update(index, field, value)

        return (
          <div key={index} className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Witness {index + 1}</p>
              {index > 0 && (
                <Button type="button" variant="ghost" size="icon-sm" title="Remove witness" onClick={() => remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <WitnessNameField
                name={`witnessFullName-${index}`}
                value={witness.witnessFullName}
                onChange={change("witnessFullName")}
                onSelect={(suggestion) => select(index, suggestion)}
                exclude={witnesses.filter((_, i) => i !== index).map((other) => other.witnessFullName)}
                error={error("witnessFullName")}
              />
              <TextField
                name={`witnessDesignation-${index}`}
                label="Designation"
                value={witness.witnessDesignation}
                onChange={change("witnessDesignation")}
                error={error("witnessDesignation")}
                placeholder="e.g. Trustee, Priest, Volunteer"
              />
              <TextField
                name={`witnessPhone-${index}`}
                label="Phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={witness.witnessPhone}
                onChange={(value) => update(index, "witnessPhone", digitsOnly(value).slice(0, 10))}
                error={error("witnessPhone")}
                placeholder="10-digit phone number"
              />
              <TextField
                name={`witnessEmail-${index}`}
                label="Email"
                type="email"
                value={witness.witnessEmail}
                onChange={change("witnessEmail")}
                error={error("witnessEmail")}
              />
              <TextField
                name={`witnessAddressLine1-${index}`}
                label="Address Line 1"
                value={witness.witnessAddressLine1}
                onChange={change("witnessAddressLine1")}
                error={error("witnessAddressLine1")}
              />
              <TextField
                name={`witnessAddressLine2-${index}`}
                label="Address Line 2"
                value={witness.witnessAddressLine2}
                onChange={change("witnessAddressLine2")}
                error={error("witnessAddressLine2")}
              />
              <TextField
                name={`witnessCity-${index}`}
                label="City"
                value={witness.witnessCity}
                onChange={change("witnessCity")}
                error={error("witnessCity")}
              />
            </div>
            <TextareaField
              name={`witnessRemarks-${index}`}
              label="Remarks"
              value={witness.witnessRemarks}
              onChange={change("witnessRemarks")}
              error={error("witnessRemarks")}
            />
          </div>
        )
      })}
      <Button type="button" variant="outline" className="self-start" onClick={add}>
        <Plus /> Add Witness
      </Button>
    </div>
  )
}

export function WitnessSummaryCard({ witnesses }: { witnesses: WitnessDetailsForm[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <p className="text-sm font-medium">Witness Details</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {witnesses.map((witness, index) => (
          <div key={index} className="flex flex-col gap-2">
            {witnesses.length > 1 && <p className="text-xs font-medium text-muted-foreground">Witness {index + 1}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryRow label="Full Name" value={witness.witnessFullName} />
              <SummaryRow label="Designation" value={witness.witnessDesignation} />
              <SummaryRow label="Phone" value={witness.witnessPhone} />
              <SummaryRow label="Email" value={witness.witnessEmail} />
              <SummaryRow label="City" value={witness.witnessCity} />
              <SummaryRow label="Remarks" value={witness.witnessRemarks} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
