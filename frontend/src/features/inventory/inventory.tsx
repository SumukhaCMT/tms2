import { useState } from "react"
import { FileDown, Loader2, Ruler } from "lucide-react"
import { Link } from "react-router-dom"

import {
  TableBody,
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
import { RowAction } from "@/components/row-actions"
import { SortableHeader } from "@/components/sortable-header"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { useRowSelection } from "@/hooks/useRowSelection"
import { ResizableTable } from "@/components/resizable-table"
import { actionHover } from "@/components/ui/action-styles"
import { ListToolbar, type ListView } from "@/components/ui/list-toolbar"
import { Skeleton } from "@/components/ui/skeleton"

import { itemTypeLabel } from "./shared/inventoryFormLogic"
import { useInventoryList } from "./useInventoryList"
import type { InventoryRow } from "./inventoryListTypes"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import DefineMeasureSheet from "./DefineMeasureSheet"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"

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
    handleBulkDelete,
    sort,
    handleSort,
    handleDownloadReceipt,
    search,
    handleSearch,
  } = useInventoryList()
  const selection = useRowSelection(currentInventory.map((item) => item.dbId))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }

  const canViewCreator = useCanViewCreator()
  const [view, setView] = useState<ListView>("list")
  const [defineMeasureOpen, setDefineMeasureOpen] = useState(false)

  const renderActions = (row: InventoryRow) => (
    <div className="flex justify-end gap-1">
      <RowAction type="view" title="View inventory" to={`/inventory/view/${row.dbId}`} />

      <Button className={actionHover.download}
        variant="ghost"
        size="icon"
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
        <RowAction type="edit" title="Edit inventory" to={`/inventory/edit/${row.dbId}`} />
      )}

      {canDelete && (
        <RowAction type="delete" title="Delete inventory" onClick={() => handleDelete(row)} />
      )}
    </div>
  )

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Inventory"
        actions={
          <>
            {canAdd && (
              <Button variant="outline" onClick={() => setDefineMeasureOpen(true)}>
                <Ruler className="size-4" /> Define Measure
              </Button>
            )}
            <Button variant="outline" render={<Link to="/inventory/usage" />}>
              Stock Usage
            </Button>
            {canAdd && <Button render={<Link to="/inventory/add" />}>Add Inventory</Button>}
          </>
        }
        onSearch={handleSearch}
        view={view}
        onViewChange={setView}
        searchPlaceholder="Search inventory..."
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && inventory.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching items" : "No inventory recorded yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Items added for your temple will show up here."}
          </p>
        </div>
      )}

      {!isLoading && inventory.length > 0 && (
        <>
          {canDelete && <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />}
          {view === "list" && (
            <ResizableTable
              columns={[
                ...(canDelete
                  ? [{
                      id: "select",
                      size: 4,
                      minSize: 3,
                      label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />,
                    }]
                  : []),
                { id: "sl", label: "Sl.no", size: 6 },
                ...(canViewCreator ? [{ id: "temple", label: "Temple", size: 13 }] : []),
                { id: "item", label: "Item Name", size: 18 },
                { id: "type", label: "Item Type", size: 12 },
                { id: "stock", label: <SortableHeader label="Stock" column="stock" sort={sort} onSort={handleSort} />, size: 10 },
                { id: "date", label: <SortableHeader label="Date" column="date" sort={sort} onSort={handleSort} />, size: 11 },
                ...(canViewCreator ? [{ id: "createdBy", label: "Created By", size: 12 }] : []),
                { id: "actions", label: "Actions", size: 12, className: "justify-end" },
              ]}
            >

                <TableBody>
                  {currentInventory.map((row, index) => (
                    <TableRow key={row.id} data-state={selection.isSelected(row.dbId) ? "selected" : undefined}>
                      {canDelete && (
                        <TableCell>
                          <Checkbox checked={selection.isSelected(row.dbId)} onCheckedChange={() => selection.toggle(row.dbId)} aria-label="Select row" />
                        </TableCell>
                      )}
                      <TableCell>{startIndex + index + 1}</TableCell>
                      {canViewCreator && <TableCell>{row.templeName}</TableCell>}
                      <TableCell className="font-medium">{row.itemName}</TableCell>
                      <TableCell>{itemTypeLabel(row.itemType)}</TableCell>
                      <TableCell>{row.stock}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      {canViewCreator && <TableCell>{row.createdByName}</TableCell>}
                      <TableCell className="text-right">
                        {renderActions(row)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </ResizableTable>
          )}

          {view === "grid" && (
            <RecordCardGrid>
              {currentInventory.map((row, index) => (
                <RecordCard
                  key={row.id}
                  index={startIndex + index + 1}
                  title={row.itemName}
                  subtitle={itemTypeLabel(row.itemType)}
                  stats={[
                    { label: "Stock", value: row.stock },
                    { label: "Date", value: row.date },
                  ]}
                  fields={[
                    { label: "Temple", value: row.templeName, hidden: !canViewCreator },
                    { label: "Created By", value: row.createdByName, hidden: !canViewCreator },
                  ]}
                  actions={renderActions(row)}
                />
              ))}
            </RecordCardGrid>
          )}

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

      <DefineMeasureSheet open={defineMeasureOpen} onOpenChange={setDefineMeasureOpen} />
    </div>
  )
}
