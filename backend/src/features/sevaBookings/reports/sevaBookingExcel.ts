import ExcelJS from "exceljs";

export interface SevaBookingReportRow {
  receiptNumber: string;
  bookingDate: string;
  bookingTime: string;
  devoteeName: string;
  devoteePhone: string;
  sevaName: string;
  deityName: string;
  sevaAmount: number;
  gstAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  bookingStatus: string;
  remarks: string;
}

export interface SevaBookingReportSummary {
  totalBookings: number;
  totalSevaAmount: number;
  totalGstAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface ExcelReportOptions {
  templeName: string;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  bookings: SevaBookingReportRow[];
  summary: SevaBookingReportSummary;
}

const currencyFormat = '"₹"#,##0.00';

export async function generateSevaBookingExcel(
  options: ExcelReportOptions,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Temple Management System";
  workbook.subject = "Seva Booking Report";
  workbook.title = "Seva Booking Report";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Seva Bookings", {
    views: [{ state: "frozen", ySplit: 6 }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  sheet.columns = [
    { key: "srNo", width: 8 },
    { key: "receiptNumber", width: 20 },
    { key: "bookingDate", width: 15 },
    { key: "bookingTime", width: 13 },
    { key: "devoteeName", width: 24 },
    { key: "devoteePhone", width: 17 },
    { key: "sevaName", width: 24 },
    { key: "deityName", width: 20 },
    { key: "sevaAmount", width: 16 },
    { key: "gstAmount", width: 15 },
    { key: "totalAmount", width: 16 },
    { key: "paymentStatus", width: 16 },
    { key: "paymentMethod", width: 18 },
    { key: "bookingStatus", width: 16 },
    { key: "remarks", width: 28 },
  ];

  sheet.mergeCells("A1:O1");
  sheet.getCell("A1").value = options.templeName;
  sheet.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF263B5A" },
  };
  sheet.getRow(1).height = 30;

  sheet.mergeCells("A2:O2");
  sheet.getCell("A2").value = "SEVA BOOKING REPORT";
  sheet.getCell("A2").font = { bold: true, size: 13 };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A3:O3");
  sheet.getCell("A3").value =
    `Period: ${options.fromDate} to ${options.toDate}`;
  sheet.getCell("A3").alignment = { horizontal: "center" };

  sheet.mergeCells("A4:O4");
  sheet.getCell("A4").value = `Generated: ${options.generatedAt}`;
  sheet.getCell("A4").alignment = { horizontal: "center" };

  const headers = [
    "Sr. No.",
    "Receipt No.",
    "Booking Date",
    "Time",
    "Devotee",
    "Phone",
    "Seva",
    "Deity",
    "Seva Amount",
    "GST",
    "Total Amount",
    "Payment",
    "Payment Method",
    "Booking Status",
    "Remarks",
  ];

  const headerRow = sheet.getRow(6);
  headerRow.values = headers;
  headerRow.height = 28;
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF365F91" },
  };

  options.bookings.forEach((booking, index) => {
    const row = sheet.addRow({
      srNo: index + 1,
      receiptNumber: booking.receiptNumber,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      devoteeName: booking.devoteeName,
      devoteePhone: booking.devoteePhone,
      sevaName: booking.sevaName,
      deityName: booking.deityName,
      sevaAmount: booking.sevaAmount,
      gstAmount: booking.gstAmount,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      bookingStatus: booking.bookingStatus,
      remarks: booking.remarks,
    });

    row.alignment = { vertical: "middle", wrapText: true };

    [9, 10, 11].forEach((columnNumber) => {
      row.getCell(columnNumber).numFmt = currencyFormat;
    });

    if (index % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F6FA" },
        };
      });
    }
  });

  const summaryStart = sheet.rowCount + 2;

  sheet.mergeCells(`A${summaryStart}:B${summaryStart}`);
  sheet.getCell(`A${summaryStart}`).value = "FINANCIAL SUMMARY";
  sheet.getCell(`A${summaryStart}`).font = { bold: true, size: 12 };

  const summaryRows: Array<[string, number]> = [
    ["Total Bookings", options.summary.totalBookings],
    ["Total Seva Amount", options.summary.totalSevaAmount],
    ["Total GST Amount", options.summary.totalGstAmount],
    ["Grand Total", options.summary.totalAmount],
    ["Paid Amount", options.summary.paidAmount],
    ["Pending Amount", options.summary.pendingAmount],
  ];

  summaryRows.forEach(([label, value], index) => {
    const row = summaryStart + index + 1;
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`B${row}`).value = value;
    sheet.getCell(`A${row}`).font = { bold: true };

    if (index > 0) {
      sheet.getCell(`B${row}`).numFmt = currencyFormat;
    }
  });

  // Borders for the complete report.
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9E0E8" } },
        left: { style: "thin", color: { argb: "FFD9E0E8" } },
        bottom: { style: "thin", color: { argb: "FFD9E0E8" } },
        right: { style: "thin", color: { argb: "FFD9E0E8" } },
      };
    });
  });

  sheet.autoFilter = {
    from: "A6",
    to: "O6",
  };

  const output = await workbook.xlsx.writeBuffer();
  return Buffer.from(output);
}