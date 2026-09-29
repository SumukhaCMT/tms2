import { Pencil, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

import { TextField, SelectField } from "@/features/donations/shared/DonationFormFields"

import { useDefineHundiTable } from "./useDefineHundiTable"

export default function HundiTable() {
  const {
    isOrgAdmin,
    canAdd,
    canEdit,
    canDelete,
    rows,
    isLoading,
    temples,
    deities,
    sheetOpen,
    setSheetOpen,
    editingId,
    form,
    errors,
    submitting,
    updateForm,
    openAddSheet,
    openEditSheet,
    handleSubmit,
    handleDelete,
  } = useDefineHundiTable()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" render={<Link to="/hundi" />} className="mb-2 -ml-2">
            <ArrowLeft className="size-4" /> Back to Hundi
          </Button>
          <h2 className="text-lg font-semibold">Define Hundi</h2>
          <p className="text-sm text-muted-foreground">
            Manage the physical hundi boxes that can be opened
          </p>
        </div>

        {canAdd && <Button onClick={openAddSheet}>Add Hundi</Button>}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No hundis defined yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Define a hundi here before you can record an opening for it.
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl.no</TableHead>
                {isOrgAdmin && <TableHead>Temple</TableHead>}
                <TableHead>Deity</TableHead>
                <TableHead>Hundi Number</TableHead>
                <TableHead>Hundi Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  {isOrgAdmin && <TableCell>{row.temp_name}</TableCell>}
                  <TableCell>{row.deity_name}</TableCell>
                  <TableCell className="font-medium">{row.hundi_number}</TableCell>
                  <TableCell>{row.hundi_name}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => openEditSheet(row)}>
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => handleDelete(row)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
    </div>
  )
}
