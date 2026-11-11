

"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { RowAction, RowActions } from "@/components/row-actions";
import { confirmDelete } from "@/components/confirm-delete";
import { useRowSelection } from "@/hooks/useRowSelection";
import { bulkDelete } from "@/utils/bulkDelete";
import DataPagination from "@/components/layout/DataPagination";

import { useModulePermissions } from "@/hooks/useModulePermissions";
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "../paymentMethodTypes";
import { deletePaymentMethod, updatePaymentMethod } from "../PaymentMethodThunks";
import ViewToggle, { type ViewMode, } from "@/components/layout/ViewToggle"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"
interface PaymentMethodsTableProps {
  items: PaymentMethod[];
  loading: boolean;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 10;

function DefaultBadge({
  value,
}: {
  value: "yes" | "no";
}) {
  return (
    <span className="inline-flex rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
      {value === "yes" ? "Default" : "No"}
    </span>
  );
}

export default function PaymentMethodTable({
  items,
  loading,
  onRefresh,
}: PaymentMethodsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewMode>("list");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const { canAdd, canEdit, canDelete, } = useModulePermissions("payment_methods");

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof items)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updatePaymentMethod({ id: Number(item.id), data: { status: status as typeof item.status } })).unwrap()
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / ITEMS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  async function handleDelete(id: number, name: string) {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete payment method?"))) return;
    setDeletingId(id);
    try {
      await dispatch(deletePaymentMethod(id)).unwrap();
      showCmtToast("success", "Payment method deleted successfully.");
      if (paginatedItems.length === 1 && currentPage > 1) setPage(currentPage - 1);
      onRefresh();
    } catch {
      return;
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteSelected() {
    const names = items.filter((item) => selection.isSelected(item.id)).map((item) => item.payment_method);
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deletePaymentMethod(id)).unwrap(), "payment methods", names);
    if (!deleted.length) return;
    selection.clear();
    if (deleted.length >= paginatedItems.length && currentPage > 1) setPage(currentPage - 1);
    onRefresh();
  }

  const selection = useRowSelection(paginatedItems.map((item) => item.id));

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading payment methods...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          // value={search}
          // onChange={(event) => {
          //   setSearch(event.target.value);
          //   setPage(1);
          // }}
          placeholder="Search Payment Method name or code..."
          className="w-full sm:w-64"
          aria-label="Search Payment Method"
        />
        <div className="flex flex-wrap items-center gap-2">
          {canAdd && (
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => navigate("/payment_methods/add")}
            >
              Add Payment Method
            </Button>
          )}

          <ViewToggle
            view={view}
            onViewChange={setView}
          />
        </div>
      </div>
      {canDelete && <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />}

      {/* LIST VIEW */}
      {view === "list" && (
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "temple-name", label: "Temple Name", size: 10 },
            { id: "payment-method", label: "Payment Method", size: 10 },
            { id: "type", label: "Type", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No payment methods found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item, index) => (
                <TableRow key={item.id} data-state={selection.isSelected(item.id) ? "selected" : undefined}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox checked={selection.isSelected(item.id)} onCheckedChange={() => selection.toggle(item.id)} aria-label="Select row" />
                    </TableCell>
                  )}
                  <TableCell>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>

                  <TableCell>{item.temple_name}</TableCell>

                  <TableCell className="font-medium">
                    {item.payment_method}
                  </TableCell>

                  <TableCell className="capitalize">
                    {item.payment_method_type}
                  </TableCell>

                  <TableCell>
                    <StatusSelect value={item.status} disabled={statusUpdatingId === item.id} onChange={canEdit ? (status) => void changeStatus(item, status) : undefined} />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      {canEdit && <RowAction type="edit" title="Edit payment method" to={`/payment_methods/edit/${item.id}`} />}
                      {canDelete && (
                        <RowAction type="delete" title="Delete payment method" disabled={deletingId === item.id} onClick={() => void handleDelete(item.id, item.payment_method)} />
                      )}
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>
      )}

      {/* GRID VIEW */}
      {view === "grid" && (
        <RecordCardGrid>
          {items.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No payment methods found.</div>
          ) : (
            paginatedItems.map((item, index) => (
              <RecordCard
                key={item.id}
                index={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                title={item.payment_method}
                subtitle={<span className="capitalize">{item.payment_method_type}</span>}
                badge={<StatusSelect value={item.status} disabled={statusUpdatingId === item.id} onChange={canEdit ? (status) => void changeStatus(item, status) : undefined} />}
                fields={[
                  { label: "Temple Name", value: item.temple_name },
                  { label: "Default", value: <DefaultBadge value={item.is_default} /> },
                  { label: "Display Order", value: item.display_order },
                  { label: "Remark", value: item.remark || "-" },
                ]}
                actions={
                  (canEdit || canDelete) && (
                    <>
                      {canEdit && <RowAction type="edit" title="Edit payment method" to={`/payment_methods/edit/${item.id}`} />}
                      {canDelete && <RowAction type="delete" title="Delete payment method" disabled={deletingId === item.id} onClick={() => void handleDelete(item.id, item.payment_method)} />}
                    </>
                  )
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

      {/* REUSABLE PAGINATION */}
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={ITEMS_PER_PAGE}
        itemName="payment methods"
        onPageChange={setPage}
      />
    </div>
  );
}