import { FileDown, Loader2 } from "lucide-react"
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
import { ListToolbar } from "@/components/ui/list-toolbar"
import { actionHover } from "@/components/ui/action-styles"
import { Skeleton } from "@/components/ui/skeleton"

import { DONATION_TYPE_BADGE } from "./donationsListTypes"
import { useDonationsList } from "./useDonationsList"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"

export default function Donations() {
  const {
    donors,
    isLoading,
    currentPage,
    view,
    setView,
    downloadingId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentDonors,
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
  } = useDonationsList()
  const selection = useRowSelection(currentDonors.map((item) => item.dbId))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }
  const canViewCreator = useCanViewCreator()

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Donors"
        actions={canAdd && <Button render={<Link to="/donations/add" />}>Add Donation</Button>}
        onSearch={handleSearch}
        searchPlaceholder="Search donors..."
        view={view}
        onViewChange={setView}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && donors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching donations" : "No donations recorded yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Donations recorded for your temple will show up here."}
          </p>
        </div>
      )}

      {!isLoading && donors.length > 0 && (
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
                ...(canViewCreator ? [{ id: "temple", label: "Temple", size: 10 }] : []),
                { id: "number", label: "Donation Number", size: 12 },
                { id: "name", label: "Donor Name", size: 11 },
                { id: "phone", label: "Phone", size: 9 },
                { id: "email", label: "Email", size: 13 },
                { id: "city", label: "City", size: 8 },
                { id: "type", label: "Type", size: 8 },
                { id: "stored", label: "Stored at", size: 9 },
                { id: "date", label: <SortableHeader label="Date" column="date" sort={sort} onSort={handleSort} />, size: 8 },
                ...(canViewCreator ? [{ id: "createdBy", label: "Created By", size: 9 }] : []),
                { id: "actions", label: "Actions", size: 10, className: "justify-end" },
              ]}
            >

              <TableBody>
                {currentDonors.map((donor, index) => (
                  <TableRow key={donor.id} data-state={selection.isSelected(donor.dbId) ? "selected" : undefined}>
                    {canDelete && (
                      <TableCell>
                        <Checkbox checked={selection.isSelected(donor.dbId)} onCheckedChange={() => selection.toggle(donor.dbId)} aria-label="Select row" />
                      </TableCell>
                    )}
                    <TableCell>{startIndex + index + 1}</TableCell>
                    {canViewCreator && <TableCell>{donor.templeName}</TableCell>}
                    <TableCell className="font-medium">{donor.id}</TableCell>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>{donor.phone}</TableCell>
                    <TableCell>{donor.email}</TableCell>
                    <TableCell>{donor.city}</TableCell>
                    <TableCell>{donor.type}</TableCell>
                    <TableCell>{donor.storedAt}</TableCell>
                    <TableCell>{donor.date}</TableCell>
                    {canViewCreator && <TableCell>{donor.createdByName}</TableCell>}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <RowAction type="view" title="View donation" to={`/donations/view/${donor.dbId}`} />

                        <Button className={actionHover.download}
                          variant="ghost"
                          size="icon"
                          title="Download receipt"
                          disabled={downloadingId === donor.dbId}
                          onClick={() => handleDownloadReceipt(donor)}
                        >
                          {downloadingId === donor.dbId ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <FileDown className="size-4" />
                          )}
                        </Button>

                        {canEdit && (
                          <RowAction type="edit" title="Edit donation" to={`/donations/edit/${donor.dbId}`} />
                        )}

                        {canDelete && (
                          <RowAction type="delete" title="Delete donation" onClick={() => handleDelete(donor)} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ResizableTable>
          )}

          {view === "grid" && (
            <RecordCardGrid>
              {currentDonors.map((donor, index) => (
                <RecordCard
                  key={donor.id}
                  index={startIndex + index + 1}
                  title={donor.name}
                  subtitle={donor.id}
                  badge={<span className={`rounded-md px-3 py-1.5 text-sm font-medium ${DONATION_TYPE_BADGE[donor.type]}`}>{donor.type}</span>}
                  stats={[
                    { label: "Stored at", value: donor.storedAt },
                    { label: "Date", value: donor.date },
                  ]}
                  fields={[
                    { label: "Temple", value: donor.templeName, hidden: !canViewCreator },
                    { label: "City", value: `${donor.city}, ${donor.state}` },
                    { label: "Email", value: donor.email },
                    { label: "Phone", value: donor.phone },
                    { label: "Created By", value: donor.createdByName, hidden: !canViewCreator },
                  ]}
                  actions={
                    <>
                      <RowAction type="view" title="View donation" to={`/donations/view/${donor.dbId}`} />
                      <Button className={actionHover.download} variant="ghost" size="icon" title="Download receipt" disabled={downloadingId === donor.dbId} onClick={() => handleDownloadReceipt(donor)}>
                        {downloadingId === donor.dbId ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                      </Button>
                      {canEdit && <RowAction type="edit" title="Edit donation" to={`/donations/edit/${donor.dbId}`} />}
                      {canDelete && <RowAction type="delete" title="Delete donation" onClick={() => handleDelete(donor)} />}
                    </>
                  }
                />
              ))}
            </RecordCardGrid>
          )}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, donors.length)} of {donors.length} donors
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
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
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
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

    </div>
  )
}
