import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react"
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

import { itemTypePlainLabel, formatUsedDateDisplay } from "./inventoryUsageTypes"
import { useInventoryUsage } from "./useInventoryUsage"

export default function InventoryUsage() {
  const { canAdd, canEdit, canDelete, rows, isLoading, handleDelete } = useInventoryUsage()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" render={<Link to="/inventory" />} className="mb-2 -ml-2">
            <ArrowLeft className="size-4" /> Back to Inventory
          </Button>
          <h2 className="text-lg font-semibold">Stock Usage</h2>
          <p className="text-sm text-muted-foreground">
            Track inventory usage and remaining stock across items
          </p>
        </div>

        {canAdd && <Button render={<Link to="/inventory/usage/add" />}>Record Usage</Button>}
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
          <p className="text-sm font-medium">No usage recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Inventory usage recorded against your items will show up here.
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl.no</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Transaction No.</TableHead>
                <TableHead>Item Type</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Total Used</TableHead>
                <TableHead>Total Remaining</TableHead>
                <TableHead>Used Date</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{row.item_name}</TableCell>
                  <TableCell>{row.transaction_number}</TableCell>
                  <TableCell>{itemTypePlainLabel(row.item_type)}</TableCell>
                  <TableCell>{row.total_stock}</TableCell>
                  <TableCell>{row.total_used}</TableCell>
                  <TableCell>{row.total_remaining}</TableCell>
                  <TableCell>{formatUsedDateDisplay(row.used_date)}</TableCell>
                  <TableCell>{row.used_by_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="View" render={<Link to={`/inventory/usage/view/${row.id}`} />}>
                        <Eye className="size-4" />
                      </Button>
                      {canEdit && (
                        <Button variant="ghost" size="icon-sm" title="Edit" render={<Link to={`/inventory/usage/edit/${row.id}`} />}>
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
    </div>
  )
}
