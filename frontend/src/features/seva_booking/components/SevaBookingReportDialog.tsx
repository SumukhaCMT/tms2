
import { useState } from "react";
import { FileSpreadsheet, FileText, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { sevaBookingService } from "../services/sevaBookingService";
import { showCmtToast } from "@/components/ui/cmt-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReportFormat = "excel" | "pdf";

export default function SevaBookingReportDialog({
  open,
  onOpenChange,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<ReportFormat>("excel");
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!fromDate || !toDate) {
      showCmtToast("expiry", "Please select both dates.");
      return;
    }

    if (fromDate > toDate) {
      showCmtToast(
        "expiry",
        "From date cannot be greater than To date.",
      );
      return;
    }

    setLoading(true);

    try {
      const blob = await sevaBookingService.exportReport({
        from_date: fromDate,
        to_date: toDate,
        format,
      });

      if (!blob.size) {
        throw new Error("No report data available.");
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `seva-booking-report-${fromDate}-to-${toDate}.${
        format === "excel" ? "xlsx" : "pdf"
      }`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showCmtToast("success", "Report downloaded successfully.");

      onOpenChange(false);
    } catch (error) {
      showCmtToast(
        "expiry",
        error instanceof Error
          ? error.message
          : "Failed to download report.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Seva Booking Report</DialogTitle>
          <DialogDescription>
            Select the booking date range and export format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                To Date
              </label>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Export Format
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                  format === "excel"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
              >
                <FileSpreadsheet className="size-8 text-green-600" />
                <div>
                  <p className="font-medium">Excel</p>
                  <p className="text-xs text-muted-foreground">
                    .xlsx format
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                  format === "pdf"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
              >
                <FileText className="size-8 text-red-600" />
                <div>
                  <p className="font-medium">PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Printable format
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleDownload}
          >
            <Download className="mr-2 size-4" />
            {loading ? "Generating..." : "Download Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
