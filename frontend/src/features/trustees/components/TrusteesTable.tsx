


import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useModulePermissions } from "@/hooks/useModulePermissions";
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

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"

import { fetchTrustees, deleteTrustee, updateTrustee } from "../trusteeThunks";

import {
  selectTrustees,
  selectTrusteesTotal,
  selectTrusteesPage,
  selectTrusteesLimit,
  selectTrusteesTotalPages,
  selectTrusteesLoading,
  selectTrusteeDeleting,
  selectTrusteesError,
} from "../trusteeSelectors";

import { fetchTemples } from "@/features/temple/templeThunks";
import { selectTemples } from "@/features/temple/templeSelectors";
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"



const PAGE_SIZE = 10;


export default function TrusteesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const trustees = useSelector(selectTrustees);
  const total = useSelector(selectTrusteesTotal);
  const currentPage = useSelector(selectTrusteesPage);
  const limit = useSelector(selectTrusteesLimit);
  const totalPages = useSelector(selectTrusteesTotalPages);
  const loading = useSelector(selectTrusteesLoading);
  const deleting = useSelector(selectTrusteeDeleting);
  const error = useSelector(selectTrusteesError);
  const temples = useSelector(selectTemples);

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
const { canAdd, canEdit, canDelete,} = useModulePermissions("Trustees");
  const selection = useRowSelection(trustees.map((item) => item.id));

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof trustees)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateTrustee({ id: Number(item.id), payload: { trustee_status: status as typeof item.trustee_status } })).unwrap()
      showCmtToast("success", "Trustee status updated successfully.")
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
        fetchTrustees({
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

  const displayedPage = Math.max(1, currentPage || page);
  const pageSize = limit || PAGE_SIZE;
  const safeTotal = Math.max(0, total);
  const safeTotalPages = Math.max(1, totalPages);

  async function refresh(removed: number) {
    if (removed >= trustees.length && page > 1) {
      setPage(page - 1);
      return;
    }
    await dispatch(fetchTrustees({ page, limit: PAGE_SIZE, search: search.trim() || undefined }));
  }

  async function handleDelete(id: number, name: string) {
    if (!(await confirmDelete(`Delete ${name}? This action removes the trustee from the active list.`, "Delete trustee?"))) return;
    try {
      await dispatch(deleteTrustee(id)).unwrap();
      showCmtToast("success", "Trustee deleted successfully.");
      await refresh(1);
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to delete trustee.");
    }
  }

  async function deleteSelected() {
    const names = trustees.filter((item) => selection.isSelected(item.id)).map((item) => item.trustee_name);
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteTrustee(id)).unwrap(), "trustees", names);
    if (!deleted.length) return;
    selection.clear();
    await refresh(deleted.length);
  }

  function handlePageChange(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > safeTotalPages ||
      nextPage === page ||
      loading
    ) {
      return;
    }

    setPage(nextPage);
  }

  function renderActions(trusteeId: number, trusteeName: string) {
    return (
      <RowActions>
        {canEdit && <RowAction type="edit" title={`Edit ${trusteeName}`} to={`/trustees/edit/${trusteeId}`} />}
        {canDelete && <RowAction type="delete" title={`Delete ${trusteeName}`} disabled={deleting} onClick={() => void handleDelete(trusteeId, trusteeName)} />}
      </RowActions>
    );
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
          placeholder="Search trustee name, email or phone..."
          className="w-full sm:w-80"
          aria-label="Search trustees"
        />

        <div className="flex flex-wrap items-center gap-2">
          {canAdd && (
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => navigate("/trustees/add")}
          >
            Add Trustee
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
                fetchTrustees({
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

      {/* TABLE OR GRID */}
      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Loading trustees...
        </div>
      ) : view === "list" ? (
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl. No.", size: 5 },
            { id: "temple", label: "Temple", size: 10 },
            { id: "trustee-name", label: "Trustee Name", size: 10 },
            { id: "position", label: "Position", size: 10 },
            { id: "email", label: "Email", size: 10 },
            { id: "phone", label: "Phone", size: 10 },
            { id: "city", label: "City", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {trustees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No trustees found.
                </TableCell>
              </TableRow>
            ) : (
              trustees.map((trustee, index) => (
                <TableRow key={trustee.id} data-state={selection.isSelected(trustee.id) ? "selected" : undefined}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox checked={selection.isSelected(trustee.id)} onCheckedChange={() => selection.toggle(trustee.id)} aria-label="Select row" />
                    </TableCell>
                  )}
                  <TableCell>
                    {(displayedPage - 1) * pageSize + index + 1}
                  </TableCell>

                  <TableCell>
                    {trustee.temple_name ||
                      (trustee.temple_id
                        ? templeNames.get(Number(trustee.temple_id)) ??
                          `Temple #${trustee.temple_id}`
                        : "All / Unassigned Trustees")}
                  </TableCell>

                  <TableCell className="font-medium">
                    {trustee.trustee_name}
                  </TableCell>

                  <TableCell>
                    {trustee.trustee_position || "—"}
                  </TableCell>

                  <TableCell>
                    {trustee.trustee_email || "—"}
                  </TableCell>

                  <TableCell>
                    {trustee.trustee_phone || "—"}
                  </TableCell>

                  <TableCell>{trustee.trustee_city || "—"}</TableCell>

                  <TableCell>
                    <StatusSelect value={trustee.trustee_status} options={["active", "inactive", "former"]} disabled={statusUpdatingId === trustee.id} onChange={canEdit ? (status) => void changeStatus(trustee, status) : undefined} />
                  </TableCell>

                  <TableCell>
                    {renderActions(trustee.id, trustee.trustee_name)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustees.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No trustees found.
            </div>
          ) : (
            trustees.map((trustee) => (
              <div key={trustee.id} className="rounded-lg border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      {trustee.trustee_name}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {trustee.trustee_position || "Trustee"}
                    </p>
                  </div>

                  <StatusSelect value={trustee.trustee_status} options={["active", "inactive", "former"]} disabled={statusUpdatingId === trustee.id} onChange={canEdit ? (status) => void changeStatus(trustee, status) : undefined} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    Temple:{" "}
                    {trustee.temple_name ||
                      (trustee.temple_id
                        ? templeNames.get(Number(trustee.temple_id)) ??
                          `Temple #${trustee.temple_id}`
                        : "All / Unassigned")}
                  </p>

                  <p>Email: {trustee.trustee_email || "—"}</p>
                  <p>Phone: {trustee.trustee_phone || "—"}</p>
                  <p>City: {trustee.trustee_city || "—"}</p>
                  <p>State: {trustee.trustee_state || "—"}</p>
                </div>

                <div className="mt-4 border-t pt-3">
                  {renderActions(trustee.id, trustee.trustee_name)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REUSABLE SERVER-SIDE PAGINATION */}
      <DataPagination
        currentPage={displayedPage}
        totalPages={safeTotalPages}
        totalItems={safeTotal}
        pageSize={pageSize}
        itemName="trustees"
        onPageChange={handlePageChange}
      />
    </div>
  );
}