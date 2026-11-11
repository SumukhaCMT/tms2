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

import { itemTypePlainLabel, formatUsedDateDisplay } from "./inventoryUsageTypes"
import { useInventoryUsage } from "./useInventoryUsage"

export default function InventoryUsage() {
  const { canAdd, canEdit, canDelete, rows, isLoading, handleDelete, handleBulkDelete, search, handleSearch, sort, handleSort } = useInventoryUsage()
  const selection = useRowSelection(rows.map((row) => row.id))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" render={<Link to="/inventory" />} className="-ml-2">
        <ArrowLeft className="size-4" /> Back to Inventory
      </Button>

      <ListToolbar
        title="Stock Usage"
        actions={canAdd && <Button render={<Link to="/inventory/usage/add" />}>Record Usage</Button>}
        onSearch={handleSearch}
        searchPlaceholder="Search usage..."
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
          <p className="text-sm font-medium">{search ? "No matching usage records" : "No usage recorded yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Inventory usage recorded against your items will show up here."}
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
            { id: "item-name", label: "Item Name", size: 10 },
            { id: "transaction-no", label: "Transaction No.", size: 10 },
            { id: "item-type", label: "Item Type", size: 10 },
            { id: "total-stock", label: <SortableHeader label="Total Stock" column="totalStock" sort={sort} onSort={handleSort} />, size: 10 },
            { id: "total-used", label: "Total Used", size: 10 },
            { id: "total-remaining", label: "Total Remaining", size: 10 },
            { id: "used-date", label: <SortableHeader label="Used Date" column="usedDate" sort={sort} onSort={handleSort} />, size: 10 },
            { id: "used-by", label: "Used By", size: 10 },
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
                <TableCell className="font-medium">{row.item_name}</TableCell>
                <TableCell>{row.transaction_number}</TableCell>
                <TableCell>{itemTypePlainLabel(row.item_type)}</TableCell>
                <TableCell>{row.total_stock}</TableCell>
                <TableCell>{row.total_used}</TableCell>
                <TableCell>{row.total_remaining}</TableCell>
                <TableCell>{formatUsedDateDisplay(row.used_date)}</TableCell>
                <TableCell>{row.used_by_name}</TableCell>
                <TableCell>
                  <RowActions>
                    <RowAction type="view" title="View" to={`/inventory/usage/view/${row.id}`} />
                    {canEdit && (
                      <RowAction type="edit" title="Edit" to={`/inventory/usage/edit/${row.id}`} />
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
