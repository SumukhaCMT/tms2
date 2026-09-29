import { useState } from "react"
import { List, LayoutGrid, Pencil, Trash2, FileDown, Loader2, Eye } from "lucide-react"
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

import { DONATION_TYPE_BADGE } from "./donationsListTypes"
import { useDonationsList } from "./useDonationsList"
import { useCanViewCreator } from "@/permissions/useCanViewCreator"
import DonationViewSheet from "./DonationViewSheet"

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
    handleDownloadReceipt,
  } = useDonationsList()
  const canViewCreator = useCanViewCreator()
  const [viewDonationId, setViewDonationId] = useState<number | null>(null)

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Donors</h2>
          <p className="text-sm text-muted-foreground">
            Manage all donors and their donations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAdd && (
            <Button render={<Link to="/donations/add" />}>
              Add Donation
            </Button>
          )}

          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
              title="List View"
            >
              <List className="size-4" />
            </Button>

            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && donors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No donations recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Donations recorded for your temple will show up here.
          </p>
        </div>
      )}

      {!isLoading && donors.length > 0 && (
        <>
          {view === "list" && (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl.no</TableHead>
                    {canViewCreator && <TableHead>Temple</TableHead>}
                    <TableHead>Donation Number</TableHead>
                    <TableHead>Donor Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stored At</TableHead>
                    <TableHead>Date</TableHead>
                    {canViewCreator && <TableHead>Created By</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentDonors.map((donor, index) => (
                    <TableRow key={donor.id}>
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="View donation"
                            onClick={() => setViewDonationId(donor.dbId)}
                          >
                            <Eye className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-sm"
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
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit donation"
                              render={<Link to={`/donations/edit/${donor.dbId}`} />}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Delete donation"
                              onClick={() => handleDelete(donor)}
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
          )}

          {view === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentDonors.map((donor, index) => (
                <div
                  key={donor.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">#{startIndex + index + 1}</p>
                      <h3 className="mt-1 truncate font-semibold">{donor.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{donor.id}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${DONATION_TYPE_BADGE[donor.type]}`}
                      >
                        {donor.type}
                      </span>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View donation"
                          onClick={() => setViewDonationId(donor.dbId)}
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Edit donation"
                            render={<Link to={`/donations/edit/${donor.dbId}`} />}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete donation"
                            onClick={() => handleDelete(donor)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Stored At</p>
                      <p className="mt-1 text-sm font-semibold">{donor.storedAt}</p>
                    </div>

                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="mt-1 text-sm font-semibold">{donor.date}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {canViewCreator && (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Temple</span>
                          <span className="font-medium">{donor.templeName}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Created By</span>
                          <span className="font-medium">{donor.createdByName}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-medium">
                        {donor.city}, {donor.state}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Email</span>
                      <span className="truncate font-medium">{donor.email}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{donor.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      <DonationViewSheet donationId={viewDonationId} onClose={() => setViewDonationId(null)} />
    </div>
  )
}
