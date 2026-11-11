
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Ticket } from "lucide-react";

import type { AppDispatch } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataPagination from "@/components/layout/DataPagination";
import ViewToggle, {
  type ViewMode,
} from "@/components/layout/ViewToggle";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useModulePermissions } from "@/hooks/useModulePermissions";

import { fetchTokens, deleteToken } from "../tokenThunks";

import {
  selectTokens,
  selectTokensLoading,
  selectTokensError,
  selectTokenPagination,
  selectTokenDeletingId,
} from "../tokenSelectors";

import IssueTokenDialog, {
  type TokenForIssue,
} from "../components/IssueTokenDialog";

const PAGE_SIZE = 10;

type TokenStatus = "active" | "inactive";

type TokenRow = {
  id: number;
  temple_id: number;
  temple_name?: string | null;
  token_name: string;
  token_code: string;
  token_status: TokenStatus;
  max_limit: number | null;
  total_issued?: number | null;
  token_remaining_tokens?: number | null;
  seva_name?: string | null;
  deity_name?: string | null;
  seva_amount?: number | string | null;
  token_display_order?: number | null;
  token_description?: string | null;
};

function StatusBadge({ status }: { status: TokenStatus }) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
      }
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getTokenLimitLabel(
  value: number | null | undefined,
): string | number {
  return value === null || value === undefined ? "Unlimited" : value;
}

function hasRemainingCapacity(token: TokenRow): boolean {
  // A null maximum means unlimited.
  if (token.max_limit === null || token.max_limit === undefined) {
    return true;
  }

  return Number(token.token_remaining_tokens ?? 0) > 0;
}

export default function TokensTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const tokens = useSelector(selectTokens);
  const pagination = useSelector(selectTokenPagination);
  const loading = useSelector(selectTokensLoading);
  const deletingId = useSelector(selectTokenDeletingId);
  const error = useSelector(selectTokensError);

  const { canAdd, canEdit, canDelete } =
    useModulePermissions("tokens");

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedToken, setSelectedToken] =
    useState<TokenForIssue | null>(null);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(
        fetchTokens({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        }),
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  const displayedPage = Math.max(1, pagination.page || page);
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const totalItems = Math.max(0, pagination.total || 0);
  const pageSize = pagination.limit || PAGE_SIZE;

  function getTempleName(token: {
    temple_id: number;
    temple_name?: string | null;
  }) {
    return token.temple_name?.trim() || `Temple #${token.temple_id}`;
  }

  function openIssueDialog(token: TokenRow) {
    if (!hasRemainingCapacity(token)) {
      return;
    }

    // Keep the token data expected by IssueTokenDialog.
    setSelectedToken(token as TokenForIssue);
    setIssueDialogOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      await dispatch(deleteToken(id)).unwrap();

      if (tokens.length === 1 && page > 1) {
        setPage(page - 1);
        return;
      }

      await dispatch(
        fetchTokens({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        }),
      ).unwrap();
    } catch {
      // Redux slice exposes deletion errors.
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
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search token name or code..."
          className="w-full sm:w-64"
          aria-label="Search tokens"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => navigate("/tokens/issued")}
          >
            Issued Token List
          </Button>

          {canAdd && (
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => navigate("/tokens/add")}
            >
              Add Token
            </Button>
          )}

          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Error */}
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
                fetchTokens({
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

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Loading tokens...
        </div>
      ) : view === "list" ? (
        /* LIST VIEW */
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1350px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sl. No.</TableHead>
                <TableHead>Temple</TableHead>
                <TableHead>Token Name</TableHead>
                <TableHead>Token Code</TableHead>
                <TableHead>Seva Name</TableHead>
                <TableHead>Deity Name</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead>Total Issued</TableHead>
                <TableHead>Remaining Tokens</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    No tokens found.
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((rawToken, index) => {
                  const token = rawToken as typeof rawToken & TokenRow;
                  const remaining = token.token_remaining_tokens;
                  const hasCapacity = hasRemainingCapacity(token);

                  return (
                    <TableRow key={token.id}>
                      <TableCell>
                        {(displayedPage - 1) * pageSize + index + 1}
                      </TableCell>

                      <TableCell>{getTempleName(token)}</TableCell>

                      <TableCell className="font-medium">
                        {token.token_name}
                      </TableCell>

                      <TableCell>{token.token_code}</TableCell>

                      <TableCell>
                        {token.seva_name?.trim() || "—"}
                      </TableCell>

                      <TableCell>
                        {token.deity_name?.trim() || "—"}
                      </TableCell>

                      <TableCell>
                        {getTokenLimitLabel(token.max_limit)}
                      </TableCell>

                      <TableCell>{token.total_issued ?? 0}</TableCell>

                      <TableCell>
                        <span
                          className={
                            token.max_limit == null
                              ? "font-semibold text-muted-foreground"
                              : Number(remaining ?? 0) <= 0
                                ? "font-semibold text-destructive"
                                : "font-semibold text-green-600"
                          }
                        >
                          {token.max_limit == null
                            ? "Unlimited"
                            : Number(remaining ?? 0)}
                        </span>
                      </TableCell>

                      <TableCell>
                        {formatRupees(Number(token.seva_amount ?? 0))}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={token.token_status} />
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {canAdd && token.token_status === "active" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              disabled={!hasCapacity}
                              title={
                                hasCapacity
                                  ? "Issue Tokens"
                                  : "Maximum token limit reached"
                              }
                              onClick={() => openIssueDialog(token)}
                            >
                              <Ticket className="mr-2 size-4" />
                              {hasCapacity ? "Issue Tokens" : "Limit Reached"}
                            </Button>
                          )}

                          {canEdit && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                              aria-label={`Edit ${token.token_name}`}
                              onClick={() =>
                                navigate(`/tokens/edit/${token.id}`)
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}

                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="cursor-pointer"
                                  aria-label={`Delete ${token.token_name}`}
                                  disabled={deletingId !== null}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Token?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    {token.token_name}? This action cannot be
                                    undone unless your backend supports recovery.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel className="cursor-pointer">
                                    Cancel
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    className="cursor-pointer"
                                    variant="destructive"
                                    disabled={deletingId !== null}
                                    onClick={() => {
                                      void handleDelete(token.id);
                                    }}
                                  >
                                    {deletingId === token.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No tokens found.
            </div>
          ) : (
            tokens.map((rawToken) => {
              const token = rawToken as typeof rawToken & TokenRow;
              const remaining = token.token_remaining_tokens;
              const hasCapacity = hasRemainingCapacity(token);

              return (
                <div key={token.id} className="rounded-lg border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{token.token_name}</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Code: {token.token_code}
                      </p>
                    </div>

                    <StatusBadge status={token.token_status} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Temple:</span>{" "}
                      {getTempleName(token)}
                    </p>

                    <p>
                      <span className="font-medium">Seva:</span>{" "}
                      {token.seva_name?.trim() || "—"}
                    </p>

                    <p>
                      <span className="font-medium">Deity:</span>{" "}
                      {token.deity_name?.trim() || "—"}
                    </p>

                    <p>
                      <span className="font-medium">Display Order:</span>{" "}
                      {token.token_display_order ?? "—"}
                    </p>

                    <p>
                      <span className="font-medium">Max Tokens:</span>{" "}
                      {getTokenLimitLabel(token.max_limit)}
                    </p>

                    <p>
                      <span className="font-medium">Total Issued:</span>{" "}
                      {token.total_issued ?? 0}
                    </p>

                    <p>
                      <span className="font-medium">Remaining Tokens:</span>{" "}
                      <span
                        className={
                          token.max_limit == null
                            ? "font-semibold text-muted-foreground"
                            : Number(remaining ?? 0) <= 0
                              ? "font-semibold text-destructive"
                              : "font-semibold text-green-600"
                        }
                      >
                        {token.max_limit == null
                          ? "Unlimited"
                          : Number(remaining ?? 0)}
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Amount:</span>{" "}
                      {formatRupees(Number(token.seva_amount ?? 0))}
                    </p>

                    {token.token_description && (
                      <p className="text-muted-foreground">
                        {token.token_description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
                    {canAdd && token.token_status === "active" && (
                      <Button
                        type="button"
                        size="sm"
                        className="cursor-pointer"
                        disabled={!hasCapacity}
                        title={
                          hasCapacity
                            ? "Issue Tokens"
                            : "Maximum token limit reached"
                        }
                        onClick={() => openIssueDialog(token)}
                      >
                        <Ticket className="mr-2 size-4" />
                        {hasCapacity ? "Issue Token" : "Limit Reached"}
                      </Button>
                    )}

                    {canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/tokens/edit/${token.id}`)
                        }
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                    )}

                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            disabled={deletingId !== null}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Token?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              {token.token_name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">
                              Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                              variant="destructive"
                              className="cursor-pointer"
                              disabled={deletingId !== null}
                              onClick={() => {
                                void handleDelete(token.id);
                              }}
                            >
                              {deletingId === token.id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      <DataPagination
        currentPage={displayedPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemName="Tokens"
        onPageChange={handlePageChange}
      />

      {/* Issue Token Dialog */}
      <IssueTokenDialog
        key={`${selectedToken?.id ?? "none"}-${issueDialogOpen ? "open" : "closed"}`}
        token={selectedToken}
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        page={page}
        search={search}
      />
    </div>
  );
}
