import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,

  Printer,
  Search,
} from "lucide-react";

import type { AppDispatch } from "@/app/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DataPagination from "@/components/layout/DataPagination";

import {
  fetchIssuedTokens,
  printTokenReceipt,
} from "../tokenThunks";

import type {
  IssuedToken,
  IssuedTokensPagination,
} from "../tokenTypes";

const PAGE_SIZE = 10;

const DEFAULT_PAGINATION: IssuedTokensPagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function formatRupees(amount: number | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN");
}

function StatusBadge({ status }: { status: string }) {
  const completed = status.toLowerCase() === "completed";

  return (
    <span
      className={
        completed
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700"
      }
    >
      {status}
    </span>
  );
}

export default function IssuedTokenList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [items, setItems] = useState<IssuedToken[]>([]);
  const [pagination, setPagination] =
    useState<IssuedTokensPagination>(DEFAULT_PAGINATION);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await dispatch(
          fetchIssuedTokens({
            page,
            limit: PAGE_SIZE,
            search: search.trim() || undefined,
          }),
        ).unwrap();

        setItems(result.items);
        setPagination(result.pagination);
      } catch (err) {
        setError(
          typeof err === "string"
            ? err
            : "Unable to load issued tokens.",
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  const displayedPage = Math.max(1, pagination.page || page);

  const totalPages = Math.max(
    1,
    pagination.totalPages || 1,
  );

  async function handlePrint(id: number) {
    // Open synchronously to avoid browser popup blocking.
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Please allow pop-ups to print the receipt.");
      return;
    }

    setPrintingId(id);

    try {
      const html = await dispatch(
        printTokenReceipt(id),
      ).unwrap();

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      printWindow.close();

      setError(
        typeof err === "string"
          ? err
          : "Unable to print receipt.",
      );
    } finally {
      setPrintingId(null);
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
        <div>
          <h2 className="text-xl font-semibold">
            Issued Token List
          </h2>

          <p className="text-sm text-muted-foreground">
            View all issued tokens and print receipts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => navigate("/tokens")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Tokens
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search token, receipt, seva or deity..."
            className="pl-9"
            aria-label="Search issued tokens"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Loading issued tokens...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1500px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sl. No.</TableHead>
               
                <TableHead>Token Name</TableHead>
                <TableHead>Receipt Number</TableHead>
                <TableHead>Seva</TableHead>
                <TableHead>Deity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Performed Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-24 text-center"
                  >
                    No issued tokens found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {(displayedPage - 1) * pagination.limit +
                        index +
                        1}
                    </TableCell>

                    

                    <TableCell>
                      {item.token_name || "—"}
                    </TableCell>

                    <TableCell>
                      {item.token_receipt_number || "—"}
                    </TableCell>

                    <TableCell>
                      {item.token_seva_name || "—"}
                    </TableCell>

                    <TableCell>
                      {item.token_deity_name || "—"}
                    </TableCell>

                    <TableCell>
                      {item.token_quantity}
                    </TableCell>

                    <TableCell>
                      {formatDate(item.token_performed_date)}
                    </TableCell>

                    <TableCell>
                      {item.token_payment_method || "—"}
                    </TableCell>

                    <TableCell>
                      {formatRupees(item.token_total_amount)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={item.token_status} />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                       

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer"
                          title="Print receipt"
                          aria-label={`Print receipt ${item.id}`}
                          disabled={printingId !== null}
                          onClick={() => void handlePrint(item.id)}
                        >
                          <Printer className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <DataPagination
        currentPage={displayedPage}
        totalPages={totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        itemName="Issued Tokens"
        onPageChange={handlePageChange}
      />
    </div>
  );
}