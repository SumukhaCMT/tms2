import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
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

import { useHundiTracking } from "./useHundiTracking"

function formatDepositDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function HundiTracking() {
  const { canAdd, canEdit, canDelete, rows, isLoading, handleDelete } = useHundiTracking()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" render={<Link to="/hundi" />} className="mb-2 -ml-2">
            <ArrowLeft className="size-4" /> Back to Hundi
          </Button>
          <h2 className="text-lg font-semibold">Bank Deposit Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Track hundi cash deposited to the bank, and what's still remaining
          </p>
        </div>

        {canAdd && <Button render={<Link to="/hundi/tracking/add" />}>Add Tracking</Button>}
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
          <p className="text-sm font-medium">No deposits recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bank deposits made against a counted hundi will show up here.
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl.no</TableHead>
                <TableHead>Temple</TableHead>
                <TableHead>Hundi</TableHead>
                <TableHead>Total Cash</TableHead>
                <TableHead>Deposited</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Deposit Date</TableHead>
                <TableHead>Deposited By</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon-sm" title="Edit" render={<Link to={`/hundi/tracking/edit/${row.id}`} />}>
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
