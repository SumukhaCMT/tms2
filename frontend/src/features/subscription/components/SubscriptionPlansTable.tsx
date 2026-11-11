



import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "@/app/store";

import DataPagination from "@/components/layout/DataPagination";

import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { RowAction, RowActions } from "@/components/row-actions";
import { confirmDelete } from "@/components/confirm-delete";
import { useRowSelection } from "@/hooks/useRowSelection";
import { bulkDelete } from "@/utils/bulkDelete";
import { ListToolbar } from "@/components/ui/list-toolbar";


import {
  selectSubscriptionPlans,
  selectSubscriptionPlansLoading,
  selectSubscriptionPlansError,
} from "../subscriptionPlanSelectors";

import {
  fetchSubscriptionPlans,
  editSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../subscriptionPlanThunks";
import { StatusSelect } from "@/components/ui/status-select"
import { showCmtToast } from "@/components/ui/cmt-toast"

const PAGE_SIZE = 10;

type ViewMode = "list" | "grid";

export default function SubscriptionPlansTable() {
  const dispatch = useDispatch<AppDispatch>();

  const plans = useSelector(selectSubscriptionPlans) ?? [];

  const loading = useSelector(selectSubscriptionPlansLoading);
  const error = useSelector(selectSubscriptionPlansError);

  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // FETCH SUBSCRIPTION PLANS
  // --------------------------------------------------

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  async function changeStatus(item: (typeof plans)[number], status: string) {
    setStatusUpdatingId(Number(item.id))
    try {
      await dispatch(editSubscriptionPlan({ id: Number(item.id), data: { plan_status: status as typeof item.plan_status } })).unwrap()
      showCmtToast("success", "Status updated.")
    } catch (error) {
      showCmtToast("expiry", typeof error === "string" ? error : "Failed to update status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  useEffect(() => {
    void dispatch(fetchSubscriptionPlans(search));
  }, [dispatch, search]);

  // --------------------------------------------------
  // CLIENT-SIDE PAGINATION
  // --------------------------------------------------

  const total = plans.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedPlans = plans.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const selection = useRowSelection(paginatedPlans.map((plan) => plan.id));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const refresh = async () => {
    const refreshedPlans = await dispatch(fetchSubscriptionPlans(search));
    if (fetchSubscriptionPlans.fulfilled.match(refreshedPlans)) {
      const remainingPages = Math.max(1, Math.ceil(refreshedPlans.payload.length / PAGE_SIZE));
      setCurrentPage((page) => Math.min(page, remainingPages));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete ${name}? This action cannot be undone.`, "Delete subscription plan?"))) return;
    const result = await dispatch(deleteSubscriptionPlan(id));
    if (deleteSubscriptionPlan.rejected.match(result)) return;
    showCmtToast("success", "Subscription plan deleted successfully.");
    await refresh();
  };

  const deleteSelected = async () => {
    const names = plans.filter((plan) => selection.isSelected(plan.id)).map((plan) => plan.plan_name);
    const deleted = await bulkDelete(selection.selectedIds, (id) => dispatch(deleteSubscriptionPlan(id)).unwrap(), "subscription plans", names);
    if (!deleted.length) return;
    selection.clear();
    await refresh();
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading && plans.length === 0 && !search) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading subscription plans...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && plans.length === 0) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          className="mt-4 cursor-pointer"
          onClick={() => {
            void dispatch(fetchSubscriptionPlans(search));
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Subscription Plans"
        actions={
          <NavLink to="/subscriptionplans/add">
            <Button className="cursor-pointer">
              Add Subscription Plan
            </Button>
          </NavLink>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search plans..."
        view={view}
        onViewChange={setView}
      />

      <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />

      {/* LIST VIEW */}

      {view === "list" && (
        <ResizableTable
          columns={[
            { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
            { id: "sl-no", label: "Sl.no", size: 5 },
            { id: "plan-name", label: "Plan Name", size: 10 },
            { id: "plan-code", label: "Plan Code", size: 10 },
            { id: "module-id", label: "Module ID", size: 10 },
            { id: "plan-type", label: "Plan Type", size: 10 },
            { id: "quantity", label: "Quantity", size: 10 },
            { id: "duration", label: "Duration", size: 10 },
            { id: "price", label: "Price", size: 10 },
            { id: "gst", label: "GST", size: 10 },
            { id: "total-price", label: "Total Price", size: 10 },
            { id: "amc-price", label: "AMC Price", size: 10 },
            { id: "status", label: "Status", size: 10 },
            { id: "actions", label: "Actions", size: 10, className: "justify-end" },
          ]}
        >

          <TableBody>
            {paginatedPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="h-24 text-center">
                  No subscription plans found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPlans.map((plan, index) => (
                <TableRow key={plan.id} data-state={selection.isSelected(plan.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={selection.isSelected(plan.id)} onCheckedChange={() => selection.toggle(plan.id)} aria-label="Select row" />
                  </TableCell>
                  <TableCell>
                    {(safeCurrentPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>

                  <TableCell className="font-medium">
                    {plan.plan_name}
                  </TableCell>

                  <TableCell>{plan.plan_code}</TableCell>
                  <TableCell>{plan.module_id}</TableCell>

                  <TableCell className="capitalize">
                    {plan.plan_type}
                  </TableCell>

                  <TableCell>{plan.plan_quantity ?? "-"}</TableCell>

                  <TableCell>
                    {plan.plan_duration_months
                      ? `${plan.plan_duration_months} Months`
                      : "-"}
                  </TableCell>

                  <TableCell>
                    ₹{Number(plan.plan_price).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {Number(plan.plan_gst_percentage).toFixed(2)}%
                  </TableCell>

                  <TableCell>
                    ₹{Number(plan.plan_total_price).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {plan.plan_amc_price == null
                      ? "-"
                      : `₹${Number(plan.plan_amc_price).toFixed(2)}`}
                  </TableCell>

                  <TableCell>
                    <StatusSelect value={plan.plan_status} disabled={statusUpdatingId === plan.id} onChange={(status) => void changeStatus(plan, status)} />
                  </TableCell>

                  <TableCell>
                    <RowActions>
                      <RowAction type="view" to={`/subscriptionplans/view/${plan.id}`} />
                      <RowAction type="edit" to={`/subscriptionplans/edit/${plan.id}`} />
                      <RowAction type="delete" onClick={() => void handleDelete(plan.id, plan.plan_name)} />
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
          {paginatedPlans.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">No subscription plans found.</div>
          ) : (
            paginatedPlans.map((plan, index) => (
              <RecordCard
                key={plan.id}
                index={(safeCurrentPage - 1) * PAGE_SIZE + index + 1}
                title={plan.plan_name}
                subtitle={plan.plan_code}
                badge={
                  <StatusSelect value={plan.plan_status} disabled={statusUpdatingId === plan.id} onChange={(status) => void changeStatus(plan, status)} />
                }
                stats={[
                  { label: "Plan Type", value: plan.plan_type },
                  { label: "Price", value: `₹${Number(plan.plan_price).toFixed(2)}` },
                ]}
                fields={[
                  { label: "Module ID", value: plan.module_id },
                  { label: "Quantity", value: plan.plan_quantity ?? "-" },
                  { label: "Duration", value: plan.plan_duration_months ? `${plan.plan_duration_months} Months` : "-" },
                  { label: "GST", value: `${Number(plan.plan_gst_percentage).toFixed(2)}%` },
                  { label: "Total Price", value: `₹${Number(plan.plan_total_price).toFixed(2)}` },
                  { label: "AMC Price", value: plan.plan_amc_price == null ? "-" : `₹${Number(plan.plan_amc_price).toFixed(2)}` },
                ]}
                actions={
                  <>
                    <RowAction type="view" title="View plan" to={`/subscriptionplans/view/${plan.id}`} />
                    <RowAction type="edit" title="Edit plan" to={`/subscriptionplans/edit/${plan.id}`} />
                    <RowAction type="delete" title="Delete plan" onClick={() => void handleDelete(plan.id, plan.plan_name)} />
                  </>
                }
              />
            ))
          )}
        </RecordCardGrid>
      )}

      {/* SHARED PAGINATION */}

      {total > 0 && (
        <DataPagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          itemName="subscription plans"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
