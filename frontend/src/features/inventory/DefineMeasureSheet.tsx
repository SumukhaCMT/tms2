import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { formatQuantity } from "./shared/inventoryFormLogic"
import { useDefineMeasure } from "./useDefineMeasure"

interface DefineMeasureSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module?: "inventory" | "hundi"
}

export default function DefineMeasureSheet({ open, onOpenChange, module = "inventory" }: DefineMeasureSheetProps) {
  const {
    form,
    errors,
    saving,
    measurements,
    updateField,
    updateConversion,
    addConversion,
    removeConversion,
    reset,
    handleSubmit,
  } = useDefineMeasure(open, module)

  const baseUnit = form.baseUnitName.trim() || "base unit"

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>Define Measurement</SheetTitle>
          <SheetDescription>Name the measurement, set its base unit and how other units convert to it.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            <Field data-invalid={!!errors.measurementName}>
              <FieldLabel htmlFor="measurementName">
                Name of Measurement<span className="text-destructive"> *</span>
              </FieldLabel>
              <Input
                id="measurementName"
                value={form.measurementName}
                placeholder="e.g. Weight"
                aria-invalid={!!errors.measurementName}
                onChange={(event) => updateField("measurementName", event.target.value)}
              />
              {errors.measurementName && <FieldError>{errors.measurementName}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.baseUnitName}>
              <FieldLabel htmlFor="baseUnitName">
                Base Unit<span className="text-destructive"> *</span>
              </FieldLabel>
              <Input
                id="baseUnitName"
                value={form.baseUnitName}
                placeholder="e.g. Grams"
                aria-invalid={!!errors.baseUnitName}
                onChange={(event) => updateField("baseUnitName", event.target.value)}
              />
              <FieldDescription>The unit every other unit is converted into.</FieldDescription>
              {errors.baseUnitName && <FieldError>{errors.baseUnitName}</FieldError>}
            </Field>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Conversions</p>
              <Button type="button" variant="outline" size="sm" onClick={addConversion}>
                <Plus className="size-4" /> Add Unit
              </Button>
            </div>

            {form.conversions.length === 0 && (
              <p className="text-sm text-muted-foreground">No conversions added. Only the base unit will be saved.</p>
            )}

            {form.conversions.map((row, index) => {
              const unitError = errors[`conversions.${index}.unitName`]
              const factorError = errors[`conversions.${index}.factor`]
              return (
                <div key={index} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Field data-invalid={!!unitError} className="flex-1">
                      <FieldLabel htmlFor={`unitName-${index}`}>1 Unit of</FieldLabel>
                      <Input
                        id={`unitName-${index}`}
                        value={row.unitName}
                        placeholder="e.g. Kilograms"
                        aria-invalid={!!unitError}
                        onChange={(event) => updateConversion(index, "unitName", event.target.value)}
                      />
                      {unitError && <FieldError>{unitError}</FieldError>}
                    </Field>

                    <Field data-invalid={!!factorError} className="flex-1">
                      <FieldLabel htmlFor={`factor-${index}`}>Equals</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={`factor-${index}`}
                          value={row.factor}
                          inputMode="decimal"
                          placeholder="e.g. 1000"
                          aria-invalid={!!factorError}
                          onChange={(event) => updateConversion(index, "factor", event.target.value.replace(/[^0-9.]/g, ""))}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>{baseUnit}</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {factorError && <FieldError>{factorError}</FieldError>}
                    </Field>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Remove unit"
                      className="mt-6"
                      onClick={() => removeConversion(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  {row.unitName.trim() && Number(row.factor) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      1 {row.unitName.trim()} = {formatQuantity(Number(row.factor))} {baseUnit}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {measurements.some((measurement) => measurement.units.length > 0) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Defined Measurements</p>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Equals</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurements.flatMap((measurement) =>
                        measurement.units.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell>1 {unit.unit_name}</TableCell>
                            <TableCell>
                              {formatQuantity(unit.conversion_factor)} {measurement.baseUnit}
                            </TableCell>
                          </TableRow>
                        )),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t">
          <Button type="button" variant="outline" disabled={saving} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => handleSubmit(() => handleOpenChange(false))}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save Measurement
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
