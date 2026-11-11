import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
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
    updateConversion,
    addConversion,
    removeConversion,
    reset,
    handleSubmit,
  } = useDefineMeasure(open, module)

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>Define Measurement</SheetTitle>
          <SheetDescription>Enter how one unit converts to another, e.g. 1 Kilograms = 1000 Grams.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Conversions</p>
              <Button type="button" variant="outline" size="sm" onClick={addConversion}>
                <Plus className="size-4" /> Add Unit
              </Button>
            </div>

            {form.conversions.map((row, index) => {
              const error = (field: keyof typeof row) => errors[`conversions.${index}.${field}`]
              const field = (key: keyof typeof row, placeholder: string, numeric = false) => (
                <Field data-invalid={!!error(key)}>
                  <Input
                    value={row[key]}
                    placeholder={placeholder}
                    inputMode={numeric ? "decimal" : undefined}
                    aria-invalid={!!error(key)}
                    onChange={(event) =>
                      updateConversion(index, key, numeric ? event.target.value.replace(/[^0-9.]/g, "") : event.target.value)
                    }
                  />
                  {error(key) && <FieldError>{error(key)}</FieldError>}
                </Field>
              )
              return (
                <div key={index} className="grid grid-cols-[4rem_1fr_auto_4rem_1fr_auto] items-start gap-2 rounded-lg border p-3">
                  {field("fromQuantity", "1", true)}
                  {field("fromUnit", "Kilograms")}
                  <span className="pt-1.5 text-sm text-muted-foreground">=</span>
                  {field("toQuantity", "1000", true)}
                  {field("toUnit", "Grams")}
                  <Button type="button" variant="ghost" size="icon-sm" title="Remove unit" onClick={() => removeConversion(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          {measurements.some((measurement) => measurement.units.length > 0) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Defined Measurements</p>
                <ResizableTable
                  columns={[
                    { id: "unit", label: "Unit", size: 10 },
                    { id: "equals", label: "Equals", size: 10 },
                  ]}
                >
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
                </ResizableTable>
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
