


import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {   Pencil, Trash2 } from "lucide-react";

import type { AppDispatch } from "@/app/store";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { RowAction, RowActions } from "@/components/row-actions";
import { confirmDelete } from "@/components/confirm-delete";
import { useRowSelection } from "@/hooks/useRowSelection";
import { bulkDelete } from "@/utils/bulkDelete";
import { Input } from "@/components/ui/input";
import DataPagination from "@/components/layout/DataPagination";
import ViewToggle ,{  type ViewMode,} from "@/components/layout/ViewToggle"
import { useModulePermissions } from "@/hooks/useModulePermissions";

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"

import { fetchSevas, deleteSeva, updateSeva } from "../sevaThunks";

import {
  selectSevas,
  selectSevaPagination,
  selectSevaLoading,
  selectSevaDeletingId,
  selectSevaError,
} from "../sevaSelectors";

import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples } from "../../temple/templeSelectors";
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"



const PAGE_SIZE = 10;

export default function SevaTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const sevas = useSelector(selectSevas);
  const pagination = useSelector(selectSevaPagination);
  const loading = useSelector(selectSevaLoading);
  const deletingId = useSelector(selectSevaDeletingId);
  const error = useSelector(selectSevaError);
  const temples = useSelector(selectTemples);
const { canAdd, canEdit, canDelete,} = useModulePermissions("sevas");
  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const selection = useRowSelection(sevas.map((item) => item.id));

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof sevas)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateSeva({ id: Number(item.id), payload: { seva_status: status as typeof item.seva_status } })).unwrap()
      await dispatch(fetchSevas({ page, limit: PAGE_SIZE, search: search.trim() || undefined }))
      showCmtToast("success", "Seva status updated successfully.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(fetchTemples());
  }, [dispatch]);

  // Fetch server-side results when the page or search changes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(
        fetchSevas({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        }),
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  const templeNames = useMemo(
    () =>
      new Map(
        temples.map((temple) => [
          Number(temple.id),
          temple.temp_name,
        ]),
      ),
    [temples],
  );

  const displayedPage = Math.max(1, pagination.page || page);
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const totalItems = Math.max(0, pagination.total || 0);
  const pageSize = pagination.limit || PAGE_SIZE;

  async function refresh(removed: number) {
    if (removed >= sevas.length && page > 1) {
      setPage(page - 1);
      return;
    }
    await dispatch(fetchSevas({ page, limit: PAGE_SIZE, search: search.trim() || undefined }));
  }

  async function handleDelete(id: number, name: string) {
    if (!(await confirmDelete(`Delete ${name}? This will soft-delete the Seva.`, "Delete Seva?"))) return;
    try {
      await dispatch(deleteSeva(id)).unwrap();
      showCmtToast("success", "Seva deleted successfully.");
      await refresh(1);
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to delete Seva.");
    }
  }

  async function deleteSelected() {
    const names = sevas.filter((item) => selection.isSelected(item.id)).map((item) => item.seva_name);
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteSeva(id)).unwrap(), "Sevas", names);
    if (!deleted.length) return;
    selection.clear();
    await refresh(deleted.length);
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
          }}
          placeholder="Search Seva name or code..."
          className="w-full sm:w-64"
          aria-label="Search Sevas"
        />

        <div className="flex flex-wrap items-center gap-2">
           {canAdd && (
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => navigate("/sevas/add")}
          >
            Add Seva
          </Button>

           )}
           <ViewToggle
    view={view}
    onViewChange={setView}
  />
        </div>
      </div>

      {/* ERROR MESSAGE */}
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
            className="ml-3 cursor-pointer"
            disabled={loading}
            onClick={() => {
              void dispatch(
                fetchSevas({
                  page,
                  limit: PAGE_SIZE,
                  search: search.trim() || undefined,
                }),
              );
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {canDelete && <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />}

      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Loading Sevas...
        </div>
      ) : view === "list" ? (
        /* LIST VIEW */
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl. No.", size: 5 },
            { id: "temple", label: "Temple", size: 10 },
            { id: "seva-name", label: "Seva Name", size: 10 },
            { id: "code", label: "Code", size: 10 },
            { id: "amount", label: "Amount", size: 10 },
            { id: "gst", label: "GST", size: 10 },
            { id: "default", label: "Default", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {sevas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No Sevas found.
                </TableCell>
              </TableRow>
            ) : (
              sevas.map((seva, index) => (
                <TableRow key={seva.id} data-state={selection.isSelected(seva.id) ? "selected" : undefined}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox checked={selection.isSelected(seva.id)} onCheckedChange={() => selection.toggle(seva.id)} aria-label="Select row" />
                    </TableCell>
                  )}
                  <TableCell>
                    {(displayedPage - 1) * pageSize + index + 1}
                  </TableCell>

                  <TableCell>
                    {templeNames.get(Number(seva.temple_id)) ??
                      `Temple #${seva.temple_id}`}
                  </TableCell>

                  <TableCell className="font-medium">
                    {seva.seva_name}
                  </TableCell>

                  <TableCell>{seva.seva_code}</TableCell>

                  <TableCell>
                    ₹{Number(seva.seva_amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {Number(seva.seva_gst_percent)}%
                  </TableCell>

                  <TableCell>
                    {seva.seva_is_default === "yes" ? "Yes" : "No"}
                  </TableCell>

                  <TableCell>
                    <StatusSelect value={seva.seva_status} disabled={statusUpdatingId === seva.id} onChange={canEdit ? (status) => void changeStatus(seva, status) : undefined} />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      {canEdit && <RowAction type="edit" title={`Edit ${seva.seva_name}`} to={`/sevas/edit/${seva.id}`} />}
                      {canDelete && (
                        <RowAction type="delete" title={`Delete ${seva.seva_name}`} disabled={deletingId !== null} onClick={() => void handleDelete(seva.id, seva.seva_name)} />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sevas.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No Sevas found.
            </div>
          ) : (
            sevas.map((seva) => (
              <div key={seva.id} className="rounded-lg border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{seva.seva_name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Code: {seva.seva_code}
                    </p>
                  </div>

                  <StatusSelect value={seva.seva_status} disabled={statusUpdatingId === seva.id} onChange={canEdit ? (status) => void changeStatus(seva, status) : undefined} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    Temple:{" "}
                    {templeNames.get(Number(seva.temple_id)) ??
                      `Temple #${seva.temple_id}`}
                  </p>

                  <p>
                    Amount: ₹{Number(seva.seva_amount).toFixed(2)}
                  </p>

                  <p>GST: {Number(seva.seva_gst_percent)}%</p>

                  <p>
                    Default:{" "}
                    {seva.seva_is_default === "yes" ? "Yes" : "No"}
                  </p>

                  <p>Display order: {seva.seva_display_order}</p>

                  {seva.seva_remark && <p>{seva.seva_remark}</p>}
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                   {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => navigate(`/sevas/edit/${seva.id}`)}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                   )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer"
                      disabled={deletingId !== null}
                      onClick={() => void handleDelete(seva.id, seva.seva_name)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REUSABLE SERVER-SIDE PAGINATION */}
      <DataPagination
        currentPage={displayedPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemName="Sevas"
        onPageChange={handlePageChange}
      />
    </div>
  );
}