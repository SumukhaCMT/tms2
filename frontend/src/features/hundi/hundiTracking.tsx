import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { Button } from "@/components/ui/button"
import { useRowSelection } from "@/hooks/useRowSelection"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { Checkbox } from "@/components/ui/checkbox"
import { RowAction, RowActions } from "@/components/row-actions"
import { SortableHeader } from "@/components/sortable-header"
import { ListToolbar } from "@/components/ui/list-toolbar"
import { Skeleton } from "@/components/ui/skeleton"

import { useHundiTracking } from "./useHundiTracking"

function formatDepositDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function HundiTracking() {
  const { canAdd, canEdit, canDelete, rows, isLoading, handleDelete, handleBulkDelete, search, handleSearch, sort, handleSort } = useHundiTracking()
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
        title="Bank Deposit Tracking"
        actions={canAdd && <Button render={<Link to="/hundi/tracking/add" />}>Add Tracking</Button>}
        onSearch={handleSearch}
        searchPlaceholder="Search deposits..."
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
          <p className="text-sm font-medium">{search ? "No matching deposits" : "No deposits recorded yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Bank deposits made against a counted hundi will show up here."}
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
            { id: "temple", label: "Temple", size: 10 },
            { id: "hundi", label: "Hundi", size: 10 },
            { id: "total-cash", label: "Total Cash", size: 10 },
            { id: "deposited", label: "Deposited", size: 10 },
            { id: "remaining", label: "Remaining", size: 10 },
            { id: "bank", label: "Bank", size: 10 },
            { id: "deposit-date", label: <SortableHeader label="Deposit Date" column="depositDate" sort={sort} onSort={handleSort} />, size: 10 },
            { id: "deposited-by", label: "Deposited By", size: 10 },
            { id: "remarks", label: "Remarks", size: 10 },
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
                <TableCell>{row.temp_name}</TableCell>
                <TableCell className="font-medium">{row.hundi_number} - {row.hundi_name}</TableCell>
                <TableCell>₹{row.total_cash.toFixed(2)}</TableCell>
                <TableCell>₹{row.deposit_amount.toFixed(2)}</TableCell>
                <TableCell>₹{row.remaining_amount.toFixed(2)}</TableCell>
                <TableCell>{row.bank_name}</TableCell>
                <TableCell>{formatDepositDate(row.deposit_date)}</TableCell>
                <TableCell>{row.deposited_by_name}</TableCell>
                <TableCell className="max-w-48 truncate">{row.remarks || "—"}</TableCell>
                <TableCell>
                  <RowActions>
                    {canEdit && (
                      <RowAction type="edit" title="Edit" to={`/hundi/tracking/edit/${row.id}`} />
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
    </div>
  )
}
