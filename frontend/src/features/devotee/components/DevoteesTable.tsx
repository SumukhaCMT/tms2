
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "@/app/store";
import { useModulePermissions } from "@/hooks/useModulePermissions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusSelect } from "@/components/ui/status-select";
import { ResizableTable } from "@/components/resizable-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { RowAction, RowActions } from "@/components/row-actions";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { confirmDelete } from "@/components/confirm-delete";
import { bulkDelete } from "@/utils/bulkDelete";

import { RecordCard, RecordCardGrid } from "@/components/ui/record-card";
import DataPagination from "@/components/layout/DataPagination";
import ViewToggle, { type ViewMode } from "@/components/layout/ViewToggle";

import { useRowSelection } from "@/hooks/useRowSelection";
import { showCmtToast } from "@/components/ui/cmt-toast";

import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples } from "../../temple/templeSelectors";

import {
  selectDevotees,
  selectDevoteesError,
  selectDevoteesLoading,
  selectDevoteesPagination,
} from "../devoteeSelectors";

import {
  fetchDevotees,
  updateDevotee,
  deleteDevotee,
} from "../devoteeThunks";

const PAGE_SIZE = 10;

export default function DevoteesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { canAdd, canEdit, canDelete } =
    useModulePermissions("Devotees");

  const devotees = useSelector((state: RootState) =>
    selectDevotees(state),
  );

  const loading = useSelector((state: RootState) =>
    selectDevoteesLoading(state),
  );

  const error = useSelector((state: RootState) =>
    selectDevoteesError(state),
  );

  const pagination = useSelector((state: RootState) =>
    selectDevoteesPagination(state),
  );

  const temples = useSelector((state: RootState) =>
    selectTemples(state),
  );

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [deleting, setDeleting] = useState(false);

  const selection = useRowSelection(
    devotees.map((item) => item.id),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(
        fetchDevotees({
          page,
          limit: PAGE_SIZE,
          ...(search.trim()
            ? { search: search.trim() }
            : {}),
        }),
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  useEffect(() => {
    void dispatch(fetchTemples());
  }, [dispatch]);

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

  async function refreshDevotees() {
    await dispatch(
      fetchDevotees({
        page,
        limit: PAGE_SIZE,
        ...(search.trim()
          ? { search: search.trim() }
          : {}),
      }),
    );
  }

  async function changeStatus(
    item: (typeof devotees)[number],
    status: string,
  ) {
    setStatusUpdatingId(item.id);

    try {
      await dispatch(
        updateDevotee({
          id: item.id,
          data: {
            devotee_status: status as "active" | "inactive",
          },
        }),
      ).unwrap();

      showCmtToast(
        "success",
        "Devotee status updated successfully.",
      );

      await refreshDevotees();
    } catch (error) {
      showCmtToast(
        "expiry",
        typeof error === "string"
          ? error
          : "Failed to update status.",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete(
    id: number,
    name: string,
  ) {
    const confirmed = await confirmDelete(
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      "Delete devotee?",
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await dispatch(deleteDevotee(id)).unwrap();

      showCmtToast(
        "success",
        "Devotee deleted successfully.",
      );

      if (devotees.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refreshDevotees();
      }
    } catch (error) {
      showCmtToast(
        "expiry",
        typeof error === "string"
          ? error
          : "Failed to delete devotee.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteSelected() {
    const selectedNames = devotees
      .filter((item) => selection.isSelected(item.id))
      .map((item) => item.devotee_name);

    if (selectedNames.length === 0) return;

    setDeleting(true);

    try {
      const deleted = await bulkDelete(
        selection.selectedIds,
        (id) => dispatch(deleteDevotee(id)).unwrap(),
        "devotees",
        selectedNames,
      );

      if (deleted.length > 0) {
        selection.clear();

        showCmtToast(
          "success",
          `${deleted.length} devotee(s) deleted successfully.`,
        );

        if (
          deleted.length >= devotees.length &&
          page > 1
        ) {
          setPage((current) => current - 1);
        } else {
          await refreshDevotees();
        }
      }
    } catch {
      showCmtToast(
        "expiry",
        "Failed to delete selected devotees.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
            selection.clear();
          }}
          placeholder="Search name, email or phone..."
          className="w-full sm:w-80"
          aria-label="Search devotees"
        />

        <div className="flex flex-wrap items-center gap-2">
          {canAdd && (
            <Button
              type="button"
              onClick={() => navigate("/devotees/add")}
            >
              Add Devotee
            </Button>
          )}

          <ViewToggle
            view={view}
            onViewChange={setView}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {canDelete && (
        <BulkActionBar
          count={selection.selectedIds.length}
          onClear={selection.clear}
          onDelete={() => void deleteSelected()}
        />
      )}

      {loading && devotees.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center text-sm text-muted-foreground">
          Loading devotees...
        </div>
      ) : view === "list" ? (
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
                        aria-label="Select all devotees"
                      />
                    ),
                    size: 4,
                    minSize: 3,
                  },
                ]
              : []),
            { id: "sl-no", label: "Sl. No", size: 5 },
            { id: "name", label: "Devotee Name", size: 15 },
            { id: "email", label: "Email", size: 15 },
            { id: "phone", label: "Phone", size: 12 },
            { id: "temple", label: "Temple", size: 15 },
            { id: "city", label: "City", size: 10 },
            { id: "status", label: "Status", size: 10 },
            {
              id: "actions",
              label: "Actions",
              size: 10,
              className: "justify-end",
            },
          ]}
        >
          <TableBody>
            {devotees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canDelete ? 9 : 8}
                  className="h-24 text-center"
                >
                  No devotees found.
                </TableCell>
              </TableRow>
            ) : (
              devotees.map((devotee, index) => (
                <TableRow
                  key={devotee.id}
                  data-state={
                    selection.isSelected(devotee.id)
                      ? "selected"
                      : undefined
                  }
                >
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(devotee.id)}
                        onCheckedChange={() =>
                          selection.toggle(devotee.id)
                        }
                        aria-label={`Select ${devotee.devotee_name}`}
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </TableCell>

                  <TableCell className="font-medium capitalize">
                    {devotee.devotee_name}
                  </TableCell>

                  <TableCell>
                    {devotee.devotee_email || "—"}
                  </TableCell>

                  <TableCell>
                    {devotee.devotee_phone || "—"}
                  </TableCell>

                  <TableCell className="capitalize">
                    {templeNames.get(Number(devotee.temple_id)) ??
                      (devotee.temple_id
                        ? `Temple #${devotee.temple_id}`
                        : "Organization")}
                  </TableCell>

                  <TableCell>
                    {devotee.devotee_city || "—"}
                  </TableCell>

                  <TableCell>
                    <StatusSelect
                      value={devotee.devotee_status}
                      disabled={
                        statusUpdatingId === devotee.id ||
                        !canEdit
                      }
                      onChange={
                        canEdit
                          ? (status) =>
                              void changeStatus(devotee, status)
                          : undefined
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      <RowAction
                        type="view"
                        title="View devotee"
                        to={`/devotees/view/${devotee.id}`}
                      />

                      {canEdit && (
                        <RowAction
                          type="edit"
                          title="Edit devotee"
                          to={`/devotees/edit/${devotee.id}`}
                        />
                      )}

                      {canDelete && (
                        <RowAction
                          type="delete"
                          title="Delete devotee"
                          disabled={
                            deletingId === devotee.id || deleting
                          }
                          onClick={() =>
                            void handleDelete(
                              devotee.id,
                              devotee.devotee_name,
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
        <RecordCardGrid>
          {devotees.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No devotees found.
            </div>
          ) : (
            devotees.map((devotee, index) => (
              <RecordCard
                key={devotee.id}
                index={(page - 1) * PAGE_SIZE + index + 1}
                title={devotee.devotee_name}
                subtitle={
                  devotee.devotee_phone ||
                  devotee.devotee_email ||
                  "No contact details"
                }
                badge={
                  <StatusSelect
                    value={devotee.devotee_status}
                    disabled={
                      statusUpdatingId === devotee.id ||
                      !canEdit
                    }
                    onChange={
                      canEdit
                        ? (status) =>
                            void changeStatus(devotee, status)
                        : undefined
                    }
                  />
                }
                fields={[
                  {
                    label: "Temple",
                    value:
                      templeNames.get(Number(devotee.temple_id)) ??
                      (devotee.temple_id
                        ? `Temple #${devotee.temple_id}`
                        : "Organization"),
                  },
                  {
                    label: "Email",
                    value: devotee.devotee_email || "—",
                  },
                  {
                    label: "City",
                    value: devotee.devotee_city || "—",
                  },
                  {
                    label: "Gotra",
                    value: devotee.devotee_gotra || "—",
                  },
                ]}
                actions={
                  <>
                    <RowAction
                      type="view"
                      title="View devotee"
                      to={`/devotees/view/${devotee.id}`}
                    />

                    {canEdit && (
                      <RowAction
                        type="edit"
                        title="Edit devotee"
                        to={`/devotees/edit/${devotee.id}`}
                      />
                    )}

                    {canDelete && (
                      <RowAction
                        type="delete"
                        title="Delete devotee"
                        disabled={
                          deletingId === devotee.id || deleting
                        }
                        onClick={() =>
                          void handleDelete(
                            devotee.id,
                            devotee.devotee_name,
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

      <DataPagination
        currentPage={page}
        totalPages={Math.max(1, pagination.totalPages)}
        totalItems={pagination.total}
        pageSize={PAGE_SIZE}
        itemName="devotees"
        onPageChange={(nextPage) => {
          setPage(nextPage);
          selection.clear();
        }}
      />
    </div>
  );
}
