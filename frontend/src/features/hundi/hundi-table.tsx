import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { Button } from "@/components/ui/button"
import { useRowSelection } from "@/hooks/useRowSelection"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { Checkbox } from "@/components/ui/checkbox"
import { RowAction, RowActions } from "@/components/row-actions"
import { ListToolbar } from "@/components/ui/list-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DefineHundiSheet } from "./shared/DefineHundiSheet"

import { useDefineHundiTable } from "./useDefineHundiTable"

export default function HundiTable() {
  const defineHundi = useDefineHundiTable()
  const {
    isOrgAdmin,
    canAdd,
    canEdit,
    canDelete,
    rows,
    isLoading,
    openAddSheet,
    openEditSheet,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch,
  } = defineHundi
  const selection = useRowSelection(rows.map((row) => row.id))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" render={<Link to="/hundi" />} className="-ml-2">
        <ArrowLeft className="size-4" /> Back to Hundi
      </Button>

      <ListToolbar
        title="Define Hundi"
        actions={canAdd && <Button onClick={() => openAddSheet()}>Add Hundi</Button>}
        onSearch={handleSearch}
        searchPlaceholder="Search hundis..."
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching hundis" : "No hundis defined yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Define a hundi here before you can record an opening for it."}
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && canDelete && (
        <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />
      )}

      {!isLoading && rows.length > 0 && (
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl.no", size: 5 },
            ...(isOrgAdmin ? [{ id: "temple", label: "Temple", size: 10 }] : []),
            { id: "deity", label: "Deity", size: 10 },
            { id: "hundi-number", label: "Hundi Number", size: 10 },
            { id: "hundi-name", label: "Hundi Name", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} data-state={selection.isSelected(row.id) ? "selected" : undefined}>
                {canDelete && (
                  <TableCell>
                    <Checkbox checked={selection.isSelected(row.id)} onCheckedChange={() => selection.toggle(row.id)} aria-label="Select row" />
                  </TableCell>
                )}
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
                <TableCell>
                  <RowActions>
                    {canEdit && (
                      <RowAction type="edit" title="Edit" onClick={() => openEditSheet(row)} />
                    )}
                    {canDelete && (
                      <RowAction type="delete" title="Delete" onClick={() => handleDelete(row)} />
                    )}
                  </RowActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ResizableTable>
      )}

      <DefineHundiSheet state={defineHundi} />
    </div>
  )
}
