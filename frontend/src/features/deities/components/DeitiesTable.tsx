
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "@/app/store";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { RowAction, RowActions } from "@/components/row-actions";
import { confirmDelete } from "@/components/confirm-delete";
import { useRowSelection } from "@/hooks/useRowSelection";
import { bulkDelete } from "@/utils/bulkDelete";
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples } from "../../temple/templeSelectors";
import {selectDeities, selectDeitiesDeleting, selectDeitiesError, selectDeitiesLoading,} from "../deitySelectors";
import { deleteDeity, fetchDeities, updateDeity } from "../deityThunks";
import DataPagination from "@/components/layout/DataPagination";
import ViewToggle ,{  type ViewMode,} from "@/components/layout/ViewToggle"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
const ITEMS_PER_PAGE = 10;
import { Input } from "@/components/ui/input";
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"


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

export default function DeitiesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
const { canAdd, canEdit, canDelete,} = useModulePermissions("Deities");
  const deities = useSelector((state: RootState) =>
    selectDeities(state),
  );

  const loading = useSelector((state: RootState) =>
    selectDeitiesLoading(state),
  );

  const deleting = useSelector((state: RootState) =>
    selectDeitiesDeleting(state),
  );

  const error = useSelector((state: RootState) =>
    selectDeitiesError(state),
  );

  const temples = useSelector((state: RootState) =>
    selectTemples(state),
  );

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch deities and temples when the component mounts.
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof deities)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(updateDeity({ id: Number(item.id), data: { deity_status: status as typeof item.deity_status } })).unwrap()
      showCmtToast("success", "Deity status updated successfully.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(fetchDeities());
    void dispatch(fetchTemples());
  }, [dispatch]);

  // const deityList = deities ?? [];
  const deityList = useMemo(
  () => deities ?? [],
  [deities],
);

  // Create a lookup map for temple names.
  const templeNames = useMemo(
    () =>
      new Map(
        (temples ?? []).map((temple) => [
          Number(temple.id),
          temple.temp_name,
        ]),
      ),
    [temples],
  );

  // Pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(deityList.length / ITEMS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedDeities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return deityList.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [deityList, currentPage]);

  async function handleDelete(id: number, name: string) {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete deity?"))) return;
    setDeletingId(id);
    try {
      await dispatch(deleteDeity(id)).unwrap();
      showCmtToast("success", "Deity deleted successfully.");
      if (paginatedDeities.length === 1 && currentPage > 1) setPage(currentPage - 1);
    } catch (deleteError: unknown) {
      showCmtToast("expiry", typeof deleteError === "string" ? deleteError : "Failed to delete deity.");
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteSelected() {
    const names = deityList.filter((item) => selection.isSelected(item.id)).map((item) => item.deity_name);
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteDeity(id)).unwrap(), "deities", names);
    if (!deleted.length) return;
    selection.clear();
    if (deleted.length >= paginatedDeities.length && currentPage > 1) setPage(currentPage - 1);
  }

  const selection = useRowSelection(paginatedDeities.map((item) => item.id));

  // Initial loading state.
  if (loading && deityList.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading deities...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          // value={search}
          // onChange={(event) => {
          //   setSearch(event.target.value);
          //   setPage(1);
          // }}
          placeholder="Search Deities name or code..."
          className="w-full sm:w-64"
          aria-label="Search Deities"
        />
        <div  className="flex flex-wrap items-center gap-2">
           {canAdd && (
           <Button className="cursor-pointer" type="button" onClick={() => navigate("/deities/add")}>
            Add Deity
          </Button>
           )}
          
       

     
         

          {/* List/Grid view toggle */}
         
      
          <ViewToggle
            view={view}
            onViewChange={setView}
          />

      
      </div>
       </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {canDelete && <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />}

      {/* List View */}
      {view === "list" && (
        <ResizableTable
          columns={[
            ...(canDelete ? [{ id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 }] : []),
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "temple-name", label: "Temple Name", size: 10 },
            { id: "deity-name", label: "Deity Name", size: 10 },
            { id: "code", label: "Code", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {paginatedDeities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center"
                >
                  No deities found. Add your first deity.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDeities.map((deity, index) => (
                <TableRow key={deity.id} data-state={selection.isSelected(deity.id) ? "selected" : undefined}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox checked={selection.isSelected(deity.id)} onCheckedChange={() => selection.toggle(deity.id)} aria-label="Select row" />
                    </TableCell>
                  )}
                  <TableCell>
                    {(currentPage - 1) * ITEMS_PER_PAGE +
                      index +
                      1}
                  </TableCell>

                  <TableCell className="capitalize">
                    {templeNames.get(
                      Number(deity.temple_id),
                    ) ?? `Temple #${deity.temple_id}`}
                  </TableCell>

                  <TableCell className="capitalize">
                    <div className="font-medium">
                      {deity.deity_name}
                    </div>

                    {deity.deity_description && (
                      <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                        {deity.deity_description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="capitalize">
                    {deity.deity_code}
                  </TableCell>

                 

                  <TableCell>
                    <StatusSelect value={deity.deity_status} disabled={statusUpdatingId === deity.id} onChange={canEdit ? (status) => void changeStatus(deity, status) : undefined} />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      <RowAction type="view" title="View deity" to={`/deities/view/${deity.id}`} />
                      {canEdit && <RowAction type="edit" title="Edit deity" to={`/deities/edit/${deity.id}`} />}
                      {canDelete && (
                        <RowAction
                          type="delete"
                          title="Delete deity"
                          disabled={deletingId === Number(deity.id) || Boolean(deleting)}
                          onClick={() => void handleDelete(Number(deity.id), deity.deity_name)}
                        />
                      )}
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <RecordCardGrid>
          {paginatedDeities.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No deities found. Add your first deity.</div>
          ) : (
            paginatedDeities.map((deity, index) => (
              <RecordCard
                key={deity.id}
                index={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                title={deity.deity_name}
                subtitle={`Code: ${deity.deity_code}`}
                badge={<StatusSelect value={deity.deity_status} disabled={statusUpdatingId === deity.id} onChange={canEdit ? (status) => void changeStatus(deity, status) : undefined} />}
                fields={[
                  { label: "Temple", value: templeNames.get(Number(deity.temple_id)) ?? `Temple #${deity.temple_id}` },
                  { label: "Default", value: <DefaultBadge value={deity.deity_is_default} /> },
                  { label: "Display Order", value: deity.deity_display_order },
                  { label: "Description", value: deity.deity_description, hidden: !deity.deity_description, stacked: true },
                ]}
                actions={
                  <>
                      <RowAction type="view" title="View deity" to={`/deities/view/${deity.id}`} />
                      {canEdit && <RowAction type="edit" title="Edit deity" to={`/deities/edit/${deity.id}`} />}
                      {canDelete && (
                        <RowAction type="delete" title="Delete deity" disabled={deletingId === Number(deity.id) || Boolean(deleting)} onClick={() => void handleDelete(Number(deity.id), deity.deity_name)} />
                      )}
                  </>
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

    

<DataPagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={deityList.length}
  pageSize={ITEMS_PER_PAGE}
  itemName="deities"
  onPageChange={setPage}
/>
    </div>
  );
}

