import { useState } from "react"
import { Trash2, FileDown, Loader2, Pencil, Eye, Ruler } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { itemTypeLabel } from "./shared/inventoryFormLogic"
import { useInventoryList } from "./useInventoryList"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import InventoryViewSheet from "./InventoryViewSheet"
import DefineMeasureSheet from "./DefineMeasureSheet"

export default function Inventory() {
  const {
    isLoading,
    currentPage,
    downloadingId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentInventory,
    inventory,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleDelete,
    handleDownloadReceipt,
  } = useInventoryList()

  const canViewCreator = useCanViewCreator()
  const [viewInventoryId, setViewInventoryId] = useState<number | null>(null)
  const [defineMeasureOpen, setDefineMeasureOpen] = useState(false)

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Track every item received and its stock on hand
          </p>
        </div>

        <div className="flex gap-2">
          {canAdd && (
            <Button variant="outline" onClick={() => setDefineMeasureOpen(true)}>
              <Ruler className="size-4" /> Define Measure
            </Button>
          )}
          <Button variant="outline" render={<Link to="/inventory/usage" />}>
            Stock Usage
          </Button>
          {canAdd && (
            <Button render={<Link to="/inventory/add" />}>
              Add Inventory
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && inventory.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No inventory recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Items added for your temple will show up here.
          </p>
        </div>
      )}

      {!isLoading && inventory.length > 0 && (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl.no</TableHead>
                  {canViewCreator && <TableHead>Temple</TableHead>}
                  <TableHead>Item Name</TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Date</TableHead>
                  {canViewCreator && <TableHead>Created By</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentInventory.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    {canViewCreator && <TableCell>{row.templeName}</TableCell>}
                    <TableCell className="font-medium">{row.itemName}</TableCell>
                    <TableCell>{itemTypeLabel(row.itemType)}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    {canViewCreator && <TableCell>{row.createdByName}</TableCell>}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View inventory"
                          onClick={() => setViewInventoryId(row.dbId)}
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Download receipt"
                          disabled={downloadingId === row.dbId}
                          onClick={() => handleDownloadReceipt(row)}
                        >
                          {downloadingId === row.dbId ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <FileDown className="size-4" />
                          )}
                        </Button>

                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Edit inventory"
                            render={<Link to={`/inventory/edit/${row.dbId}`} />}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete inventory"
                            onClick={() => handleDelete(row)}
                          >
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

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, inventory.length)} of {inventory.length} items
            </div>

            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handlePrevPage()
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(event) => {
                          event.preventDefault()
                          handlePageChange(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handleNextPage()
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

      <InventoryViewSheet inventoryId={viewInventoryId} onClose={() => setViewInventoryId(null)} />
      <DefineMeasureSheet open={defineMeasureOpen} onOpenChange={setDefineMeasureOpen} />
    </div>
  )
}
