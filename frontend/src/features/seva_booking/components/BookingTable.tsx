

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SevaBookingReportDialog from "./SevaBookingReportDialog";


import type { AppDispatch } from "@/app/store";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { useRowSelection } from "@/hooks/useRowSelection";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { ResizableTable } from "@/components/resizable-table";
import { RowAction, RowActions } from "@/components/row-actions";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card";

import DataPagination from "@/components/layout/DataPagination";
import ViewToggle, {
  type ViewMode,
} from "@/components/layout/ViewToggle";

import { confirmDelete } from "@/components/confirm-delete";
import { bulkDelete } from "@/utils/bulkDelete";
import { showCmtToast } from "@/components/ui/cmt-toast";

import {
  fetchSevaBookings,
  deleteSevaBooking,
} from "../sevaBookingThunks";

import {
  selectSevaBookings,
  selectSevaBookingPagination,
  selectSevaBookingLoading,
  selectSevaBookingDeletingId,
  selectSevaBookingError,
} from "../sevaBookingSelectors";

const PAGE_SIZE = 10;

type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[normalizedStatus] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown"}
    </span>
  );
}

function BookingTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
      {type === "one_time"
        ? "One Time"
        : type === "recurring"
          ? "Recurring"
          : type}
    </span>
  );
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time?: string | null) {
  if (!time) return "-";

  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) return time;

  const parsedHours = Number(hours);

  if (Number.isNaN(parsedHours)) return time;

  const period = parsedHours >= 12 ? "PM" : "AM";
  const displayHours = parsedHours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
}

export default function SevaBookingsTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
const [reportOpen, setReportOpen] = useState(false);
  const { canAdd, canDelete } =
    useModulePermissions("seva_booking");

  const bookings = useSelector(selectSevaBookings);
  const pagination = useSelector(selectSevaBookingPagination);
  const loading = useSelector(selectSevaBookingLoading);
  const deletingId = useSelector(selectSevaBookingDeletingId);
  const error = useSelector(selectSevaBookingError);

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useRowSelection(
    bookings.map((booking) => booking.id),
  );

  const displayedPage = Math.max(1, pagination.page || page);
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const totalItems = Math.max(0, pagination.total || 0);
  const pageSize = pagination.limit || PAGE_SIZE;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(
        fetchSevaBookings({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        }),
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  async function refreshBookings() {
    await dispatch(
      fetchSevaBookings({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      }),
    );
  }

  function getBookingStatus(booking: (typeof bookings)[number]) {
    return (
      (booking as typeof booking & {
        booking_status?: BookingStatus;
      }).booking_status ?? "pending"
    );
  }

  async function handleDelete(id: number, devoteeName: string) {
    const confirmed = await confirmDelete(
      `Are you sure you want to delete the booking for ${
        devoteeName || "this devotee"
      }?`,
      "Delete Seva Booking?",
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteSevaBooking(id)).unwrap();

      showCmtToast(
        "success",
        "Seva booking deleted successfully.",
      );

      const isLastItemOnPage =
        bookings.length === 1 && page > 1;

      if (isLastItemOnPage) {
        setPage((current) => current - 1);
      } else {
        await refreshBookings();
      }
    } catch (error) {
      showCmtToast(
        "expiry",
        typeof error === "string"
          ? error
          : "Failed to delete Seva booking.",
      );
    }
  }

  async function deleteSelected() {
    const selectedBookings = bookings.filter((booking) =>
      selection.isSelected(booking.id),
    );

    if (selectedBookings.length === 0) return;

    const selectedNames = selectedBookings.map(
      (booking) => booking.devotee_name || "Unknown Devotee",
    );

    setBulkDeleting(true);

    try {
      const deleted = await bulkDelete(
        selection.selectedIds,
        (id) => dispatch(deleteSevaBooking(id)).unwrap(),
        "Seva Bookings",
        selectedNames,
      );

      if (deleted.length > 0) {
        selection.clear();

        showCmtToast(
          "success",
          `${deleted.length} Seva booking(s) deleted successfully.`,
        );

        if (
          deleted.length >= bookings.length &&
          page > 1
        ) {
          setPage((current) => current - 1);
        } else {
          await refreshBookings();
        }
      }
    } catch {
      showCmtToast(
        "expiry",
        "Failed to delete selected Seva bookings.",
      );
    } finally {
      setBulkDeleting(false);
    }
  }

  function handlePageChange(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page ||
      loading
    ) {
      return;
    }

    setPage(nextPage);
    selection.clear();
  }

  return (
    <div className="w-full space-y-4">
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
            selection.clear();
          }}
          placeholder="Search devotee, phone, deity or seva..."
          className="w-full sm:w-80"
          aria-label="Search Seva Bookings"
        />

        <div className="flex flex-wrap items-center gap-2">
         <Button
  type="button"
  variant="outline"
  onClick={() => setReportOpen(true)}
>
  Report
</Button>
          {canAdd && (
            <Button
            className="cursor-pointer"
              type="button"
              onClick={() => navigate("/seva_booking/add")}
            >
              Add Seva Booking
            </Button>
          )}

          <ViewToggle
            view={view}
            onViewChange={setView}
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3"
            disabled={loading}
            onClick={() => void refreshBookings()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* BULK ACTIONS */}
      {canDelete && (
        <BulkActionBar
          count={selection.selectedIds.length}
          onClear={selection.clear}
          onDelete={() => void deleteSelected()}
        />
      )}

      {/* LOADING */}
      {loading && bookings.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center text-sm text-muted-foreground">
          Loading Seva Bookings...
        </div>
      ) : view === "list" ? (
        /* LIST VIEW */
        <ResizableTable
          columns={[
            ...(canDelete
              ? [
                  {
                    id: "select",
                    label: (
                      <Checkbox
                        checked={selection.allChecked}
                        indeterminate={selection.someChecked}
                        onCheckedChange={selection.toggleAll}
                        aria-label="Select all bookings"
                      />
                    ),
                    size: 4,
                    minSize: 3,
                  },
                ]
              : []),
            { id: "sl-no", label: "Sl. No.", size: 5 },
            { id: "booking-type", label: "Booking Type", size: 10 },
            { id: "devotee", label: "Devotee Name", size: 15 },
            { id: "phone", label: "Phone", size: 11 },
            { id: "deity", label: "Deity", size: 12 },
            { id: "seva-code", label: "Seva Code", size: 10 },
            { id: "date", label: "Scheduled Date", size: 12 },
            { id: "time", label: "Scheduled Time", size: 10 },
            { id: "status", label: "Status", size: 9 },
            {
              id: "actions",
              label: "Actions",
              size: 9,
              className: "justify-end",
            },
          ]}
        >
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canDelete ? 11 : 10}
                  className="h-24 text-center"
                >
                  No Seva Bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking, index) => (
                <TableRow
                  key={booking.id}
                  data-state={
                    selection.isSelected(booking.id)
                      ? "selected"
                      : undefined
                  }
                >
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(booking.id)}
                        onCheckedChange={() =>
                          selection.toggle(booking.id)
                        }
                        aria-label={`Select booking ${booking.id}`}
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    {(displayedPage - 1) * pageSize + index + 1}
                  </TableCell>

                  <TableCell>
                    <BookingTypeBadge type={booking.booking_type} />
                  </TableCell>

                  <TableCell className="font-medium">
                    {booking.devotee_name || "-"}
                  </TableCell>

                  <TableCell>
                    {booking.devotee_phone || "-"}
                  </TableCell>

                  <TableCell>
                    {booking.deity_name || "-"}
                  </TableCell>

                  <TableCell>
                    {booking.seva_code || "-"}
                  </TableCell>

                  <TableCell>
                    {formatDate(booking.booking_scheduled_date)}
                  </TableCell>

                  <TableCell>
                    {formatTime(booking.booking_scheduled_time)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={getBookingStatus(booking)} />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      <RowAction
                        type="view"
                        title="View Seva Booking"
                        to={`/seva_booking/view/${booking.id}`}
                      />

                      {canDelete && (
                        <RowAction
                          type="delete"
                          title="Delete Seva Booking"
                          disabled={
                            deletingId === booking.id ||
                            deletingId !== null ||
                            bulkDeleting
                          }
                          onClick={() =>
                            void handleDelete(
                              booking.id,
                              booking.devotee_name || "Unknown Devotee",
                            )
                          }
                        />
                      )}
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>
      ) : (
        /* GRID VIEW */
        <RecordCardGrid>
          {bookings.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No Seva Bookings found.
            </div>
          ) : (
            bookings.map((booking, index) => (
              <RecordCard
                key={booking.id}
                index={(displayedPage - 1) * pageSize + index + 1}
                title={booking.devotee_name || "Unknown Devotee"}
                subtitle={booking.devotee_phone || "No phone number"}
                badge={
                  <StatusBadge status={getBookingStatus(booking)} />
                }
                fields={[
                  {
                    label: "Booking Type",
                    value:
                      booking.booking_type === "one_time"
                        ? "One Time"
                        : booking.booking_type === "recurring"
                          ? "Recurring"
                          : booking.booking_type,
                  },
                  {
                    label: "Deity",
                    value: booking.deity_name || "-",
                  },
                  {
                    label: "Seva Code",
                    value: booking.seva_code || "-",
                  },
                  {
                    label: "Scheduled Date",
                    value: formatDate(booking.booking_scheduled_date),
                  },
                  {
                    label: "Scheduled Time",
                    value: formatTime(booking.booking_scheduled_time),
                  },
                  {
                    label: "Remark",
                    value: booking.booking_remark || "-",
                  },
                ]}
                actions={
                  <>
                    <RowAction
                      type="view"
                      title="View Seva Booking"
                      to={`/seva_booking/view/${booking.id}`}
                    />

                    {canDelete && (
                      <RowAction
                        type="delete"
                        title="Delete Seva Booking"
                        disabled={
                          deletingId === booking.id ||
                          deletingId !== null ||
                          bulkDeleting
                        }
                        onClick={() =>
                          void handleDelete(
                            booking.id,
                            booking.devotee_name || "Unknown Devotee",
                          )
                        }
                      />
                    )}
                  </>
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

      {/* SERVER-SIDE PAGINATION */}
      <DataPagination
        currentPage={displayedPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemName="Seva Bookings"
        onPageChange={handlePageChange}
      />
        <SevaBookingReportDialog
    open={reportOpen}
    onOpenChange={setReportOpen}
  />
    </div>
  );
}
