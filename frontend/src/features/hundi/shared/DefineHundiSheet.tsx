import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SelectField, TextField } from "@/features/donations/shared/DonationFormFields"

import type { useDefineHundiTable } from "../useDefineHundiTable"

export function DefineHundiSheet({ state }: { state: ReturnType<typeof useDefineHundiTable> }) {
  const { isOrgAdmin, temples, deities, sheetOpen, setSheetOpen, editingId, form, errors, submitting, updateForm, handleSubmit } = state

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editingId ? "Edit Hundi" : "Define Hundi"}</SheetTitle>
          <SheetDescription>
            {editingId ? "Update this hundi's details." : "Add a new hundi box that can later be opened."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          {isOrgAdmin && (
            <SelectField
              name="templeId"
              label="Temple"
              required
              value={form.templeId}
              onChange={(value) => updateForm("templeId", value)}
              options={temples.map((temple) => ({ value: String(temple.id), label: temple.temp_name }))}
              error={errors.templeId}
              placeholder={temples.length ? "Select temple" : "Loading temples…"}
              disabled={!temples.length}
            />
          )}
          <SelectField
            name="deityId"
            label="Deity"
            required
            value={form.deityId}
            onChange={(value) => updateForm("deityId", value)}
            options={deities.map((deity) => ({ value: String(deity.id), label: deity.name }))}
            error={errors.deityId}
            placeholder={isOrgAdmin && !form.templeId ? "Select a temple first" : "Select deity"}
            disabled={isOrgAdmin && !form.templeId}
          />
          <TextField
            name="hundiNumber"
            label="Hundi Number"
            required
            value={form.hundiNumber}
            onChange={(value) => updateForm("hundiNumber", value)}
            error={errors.hundiNumber}
            placeholder="e.g. 1, Main Hundi"
          />
          <TextField
            name="hundiName"
            label="Hundi Name"
            required
            value={form.hundiName}
            onChange={(value) => updateForm("hundiName", value)}
            error={errors.hundiName}
            placeholder="e.g. Main Prayer Hall Hundi"
          />
          {editingId && (
            <SelectField
              name="status"
              label="Status"
              required
              value={form.status}
              onChange={(value) => updateForm("status", value as "active" | "inactive")}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          )}
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            {editingId ? "Save Changes" : "Define Hundi"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
