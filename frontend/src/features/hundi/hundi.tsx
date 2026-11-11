import { useRef, useState } from "react"
import { FileDown, Loader2, Upload, FileCheck, Ruler } from "lucide-react"
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

import { useHundiList } from "./useHundiList"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import DefineMeasureSheet from "@/features/inventory/DefineMeasureSheet"
import type { HundiRow } from "./hundiListTypes"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"

export default function Hundi() {
  const {
    isLoading,
    currentPage,
    downloadingId,
    uploadingSignedId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentHundis,
    hundis,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleDelete,
    handleBulkDelete,
    sort,
    handleSort,
    handleDownloadReceipt,
    handleUploadSignedReceipt,
    handleDownloadSignedReceipt,
    search,
    handleSearch,
  } = useHundiList()
  const selection = useRowSelection(currentHundis.map((item) => item.dbId))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }
  const canViewCreator = useCanViewCreator()
  const [view, setView] = useState<ListView>("list")

  const [defineMeasureOpen, setDefineMeasureOpen] = useState(false)
  const signedReceiptInputRef = useRef<HTMLInputElement>(null)
  const pendingSignedUploadHundi = useRef<HundiRow | null>(null)

  function triggerSignedUpload(hundi: HundiRow) {
    pendingSignedUploadHundi.current = hundi
    signedReceiptInputRef.current?.click()
  }

  const renderActions = (hundi: HundiRow) => (
    <div className="flex justify-end gap-1">
      <RowAction type="view" title="View hundi" to={`/hundi/view/${hundi.dbId}`} />

      <Button className={actionHover.download}
        variant="ghost"
        size="icon"
        title="Download receipt"
        disabled={downloadingId === hundi.dbId}
        onClick={() => handleDownloadReceipt(hundi)}
      >
        {downloadingId === hundi.dbId ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
      </Button>

      {canEdit && hundi.hasSignedReceipt ? (
        <Button className={actionHover.download}
          variant="ghost"
          size="icon"
          title="Download signed receipt"
          onClick={() => handleDownloadSignedReceipt(hundi)}
        >
          <FileCheck className="size-4" />
        </Button>
      ) : (
        canEdit && (
          <Button className={actionHover.upload}
            variant="ghost"
            size="icon"
            title="Upload signed receipt"
            disabled={uploadingSignedId === hundi.dbId}
            onClick={() => triggerSignedUpload(hundi)}
          >
            {uploadingSignedId === hundi.dbId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
          </Button>
        )
      )}

      {canEdit && (
        <RowAction type="edit" title="Edit hundi" to={`/hundi/edit/${hundi.dbId}`} />
      )}

      {canDelete && (
        <RowAction type="delete" title="Delete hundi" onClick={() => handleDelete(hundi)} />
      )}
    </div>
  )

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Hundi"
        actions={
          <>
            {canAdd && (
              <Button variant="outline" onClick={() => setDefineMeasureOpen(true)}>
                <Ruler className="size-4" /> Define Measure
              </Button>
            )}
            <Button variant="outline" render={<Link to="/hundi/define" />}>
              Define Hundi
            </Button>
            <Button variant="outline" render={<Link to="/hundi/tracking" />}>
              Tracking
            </Button>
            {canAdd && <Button render={<Link to="/hundi/add" />}>Add Hundi</Button>}
          </>
        }
        onSearch={handleSearch}
        view={view}
        onViewChange={setView}
        searchPlaceholder="Search hundis..."
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && hundis.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching hundis" : "No hundi openings recorded yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Hundis opened for your temple will show up here."}
          </p>
        </div>
      )}

      {!isLoading && hundis.length > 0 && (
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
                { id: "sl", label: "Sl.no", size: 5 },
                { id: "openedAt", label: <SortableHeader label="Opened At" column="openedAt" sort={sort} onSort={handleSort} />, size: 11 },
                ...(canViewCreator ? [{ id: "temple", label: "Temple", size: 10 }] : []),
                { id: "deity", label: "Deity", size: 10 },
                { id: "hundi", label: "Hundi", size: 14 },
                { id: "witness", label: "Witness", size: 11 },
                { id: "cash", label: "Total Cash", size: 9 },
                { id: "date", label: <SortableHeader label="Date" column="date" sort={sort} onSort={handleSort} />, size: 9 },
                ...(canViewCreator ? [{ id: "createdBy", label: "Created By", size: 10 }] : []),
                { id: "actions", label: "Actions", size: 11, className: "justify-end" },
              ]}
            >

                <TableBody>
                  {currentHundis.map((hundi, index) => (
                    <TableRow key={hundi.id} data-state={selection.isSelected(hundi.dbId) ? "selected" : undefined}>
                      {canDelete && (
                        <TableCell>
                          <Checkbox checked={selection.isSelected(hundi.dbId)} onCheckedChange={() => selection.toggle(hundi.dbId)} aria-label="Select row" />
                        </TableCell>
                      )}
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{hundi.openedAt}</TableCell>
                      {canViewCreator && <TableCell>{hundi.templeName}</TableCell>}
                      <TableCell>{hundi.deityName}</TableCell>
                      <TableCell className="font-medium">{hundi.hundiNumber} - {hundi.hundiName}</TableCell>
                      <TableCell>{hundi.witnessName}</TableCell>
                      <TableCell>₹{hundi.totalCash.toFixed(2)}</TableCell>
                      <TableCell>{hundi.date}</TableCell>
                      {canViewCreator && <TableCell>{hundi.createdByName}</TableCell>}
                      <TableCell className="text-right">
                        {renderActions(hundi)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </ResizableTable>
          )}

          {view === "grid" && (
            <RecordCardGrid>
              {currentHundis.map((hundi, index) => (
                <RecordCard
                  key={hundi.id}
                  index={startIndex + index + 1}
                  title={`${hundi.hundiNumber} - ${hundi.hundiName}`}
                  subtitle={hundi.deityName}
                  stats={[
                    { label: "Total Cash", value: `₹${hundi.totalCash.toFixed(2)}` },
                    { label: "Date", value: hundi.date },
                  ]}
                  fields={[
                    { label: "Temple", value: hundi.templeName, hidden: !canViewCreator },
                    { label: "Opened At", value: hundi.openedAt },
                    { label: "Witness", value: hundi.witnessName },
                    { label: "Created By", value: hundi.createdByName, hidden: !canViewCreator },
                  ]}
                  actions={renderActions(hundi)}
                />
              ))}
            </RecordCardGrid>
          )}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, hundis.length)} of {hundis.length} hundis
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

      <input
        ref={signedReceiptInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          const hundi = pendingSignedUploadHundi.current
          if (file && hundi) handleUploadSignedReceipt(hundi, file)
          event.target.value = ""
        }}
      />
      <DefineMeasureSheet open={defineMeasureOpen} onOpenChange={setDefineMeasureOpen} module="hundi" />
    </div>
  )
}
