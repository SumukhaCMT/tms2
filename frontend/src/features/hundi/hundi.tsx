import { useRef, useState } from "react"
import { Trash2, FileDown, Loader2, Pencil, Upload, FileCheck, Eye, Ruler } from "lucide-react"
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

import { useHundiList } from "./useHundiList"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import HundiViewSheet from "./HundiViewSheet"
import DefineMeasureSheet from "@/features/inventory/DefineMeasureSheet"
import type { HundiRow } from "./hundiListTypes"

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
    handleDownloadReceipt,
    handleUploadSignedReceipt,
    handleDownloadSignedReceipt,
  } = useHundiList()
  const canViewCreator = useCanViewCreator()

  const [viewHundiId, setViewHundiId] = useState<number | null>(null)
  const [defineMeasureOpen, setDefineMeasureOpen] = useState(false)
  const signedReceiptInputRef = useRef<HTMLInputElement>(null)
  const pendingSignedUploadHundi = useRef<HundiRow | null>(null)

  function triggerSignedUpload(hundi: HundiRow) {
    pendingSignedUploadHundi.current = hundi
    signedReceiptInputRef.current?.click()
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hundi</h2>
          <p className="text-sm text-muted-foreground">
            Track every hundi opening and its cash/item count
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          {canAdd && (
            <Button render={<Link to="/hundi/add" />}>
              Add Hundi
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

      {!isLoading && hundis.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No hundi openings recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hundis opened for your temple will show up here.
          </p>
        </div>
      )}

      {!isLoading && hundis.length > 0 && (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sl.no</TableHead>
                  <TableHead>Opened At</TableHead>
                  {canViewCreator && <TableHead>Temple</TableHead>}
                  <TableHead>Deity</TableHead>
                  <TableHead>Hundi</TableHead>
                  <TableHead>Witness</TableHead>
                  <TableHead>Total Cash</TableHead>
                  <TableHead>Date</TableHead>
                  {canViewCreator && <TableHead>Created By</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentHundis.map((hundi, index) => (
                  <TableRow key={hundi.id}>
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View hundi"
                          onClick={() => setViewHundiId(hundi.dbId)}
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Download signed receipt"
                            onClick={() => handleDownloadSignedReceipt(hundi)}
                          >
                            <FileCheck className="size-4" />
                          </Button>
                        ) : (
                          canEdit && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Edit hundi"
                            render={<Link to={`/hundi/edit/${hundi.dbId}`} />}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete hundi"
                            onClick={() => handleDelete(hundi)}
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
      <HundiViewSheet hundiId={viewHundiId} onClose={() => setViewHundiId(null)} />
      <DefineMeasureSheet open={defineMeasureOpen} onOpenChange={setDefineMeasureOpen} module="hundi" />
    </div>
  )
}
