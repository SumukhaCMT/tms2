import PDFDocument from "pdfkit";

import type {
  SevaBookingReportRow,
  SevaBookingReportSummary,
} from "./sevaBookingExcel";

interface PdfReportOptions {
  templeName: string;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  bookings: SevaBookingReportRow[];
  summary: SevaBookingReportSummary;
}

const formatCurrency = (value: number): string =>
  `Rs. ${Number(value || 0).toFixed(2)}`;

export function generateSevaBookingPdf(
  options: PdfReportOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: {
        top: 35,
        bottom: 40,
        left: 25,
        right: 25,
      },
      bufferPages: true,
      autoFirstPage: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width;
    const left = 25;
    const right = pageWidth - 25;
    const tableWidth = right - left;

    const columns = [
      { title: "#", width: 25 },
      { title: "Receipt", width: 65 },
      { title: "Date", width: 52 },
      { title: "Devotee", width: 90 },
      { title: "Phone", width: 65 },
      { title: "Seva", width: 85 },
      { title: "Deity", width: 65 },
      { title: "Seva Amt.", width: 65 },
      { title: "GST", width: 55 },
      { title: "Total", width: 65 },
      { title: "Payment", width: 55 },
      { title: "Status", width: 55 },
    ];

    // Scale columns to the available printable width.
    const originalWidth = columns.reduce(
      (total, column) => total + column.width,
      0,
    );
    const scale = tableWidth / originalWidth;

    columns.forEach((column) => {
      column.width *= scale;
    });

    const drawHeader = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(options.templeName, left, 30, {
          width: tableWidth,
          align: "center",
        });

      doc
        .fontSize(12)
        .text("SEVA BOOKING REPORT", left, 52, {
          width: tableWidth,
          align: "center",
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Period: ${options.fromDate} to ${options.toDate}   |   Generated: ${options.generatedAt}`,
          left,
          72,
          { width: tableWidth, align: "center" },
        );
    };

    let y = 95;
    const rowHeight = 25;

    const drawTableHeader = () => {
      let x = left;

      doc.rect(left, y, tableWidth, rowHeight).fill("#365F91");

      doc.font("Helvetica-Bold").fontSize(7).fillColor("#FFFFFF");

      columns.forEach((column) => {
        doc.text(column.title, x + 2, y + 8, {
          width: column.width - 4,
          align: "center",
          lineBreak: false,
        });
        x += column.width;
      });

      doc.fillColor("#000000");
      y += rowHeight;
    };

    const drawPageHeader = () => {
      drawHeader();
      y = 95;
      drawTableHeader();
    };

    drawPageHeader();

    options.bookings.forEach((booking, index) => {
      if (y + rowHeight > doc.page.height - 90) {
        doc.addPage();
        drawPageHeader();
      }

      const values = [
        String(index + 1),
        booking.receiptNumber || "-",
        booking.bookingDate || "-",
        booking.devoteeName || "-",
        booking.devoteePhone || "-",
        booking.sevaName || "-",
        booking.deityName || "-",
        formatCurrency(booking.sevaAmount),
        formatCurrency(booking.gstAmount),
        formatCurrency(booking.totalAmount),
        booking.paymentStatus || "-",
        booking.bookingStatus || "-",
      ];

      let x = left;

      if (index % 2 === 1) {
        doc.rect(left, y, tableWidth, rowHeight).fill("#F1F4F8");
      }

      doc.font("Helvetica").fontSize(6.5).fillColor("#222222");

      columns.forEach((column, columnIndex) => {
        doc.text(values[columnIndex], x + 2, y + 8, {
          width: column.width - 4,
          height: rowHeight - 4,
          ellipsis: true,
          lineBreak: false,
          align: columnIndex >= 7 && columnIndex <= 9 ? "right" : "left",
        });

        x += column.width;
      });

      doc
        .moveTo(left, y + rowHeight)
        .lineTo(right, y + rowHeight)
        .lineWidth(0.3)
        .strokeColor("#D5DCE5")
        .stroke();

      y += rowHeight;
    });

    // Start the financial summary on a fresh page if there is insufficient space.
    if (y + 125 > doc.page.height - 55) {
      doc.addPage();
      drawPageHeader();
    } else {
      y += 15;
    }

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#263B5A");
    doc.text("FINANCIAL SUMMARY", left, y);
    y += 20;

    const summaryItems: Array<[string, string]> = [
      ["Total Bookings", String(options.summary.totalBookings)],
      ["Total Seva Amount", formatCurrency(options.summary.totalSevaAmount)],
      ["Total GST Amount", formatCurrency(options.summary.totalGstAmount)],
      ["Grand Total", formatCurrency(options.summary.totalAmount)],
      ["Paid Amount", formatCurrency(options.summary.paidAmount)],
      ["Pending Amount", formatCurrency(options.summary.pendingAmount)],
    ];

    summaryItems.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#333333");
      doc.text(label, left, y, { width: 150 });

      doc.font("Helvetica").text(value, left + 155, y, { width: 150 });
      y += 13;
    });

    // Add page numbers to every page, including pages created by overflow.
    const range = doc.bufferedPageRange();

    for (let page = range.start; page < range.start + range.count; page += 1) {
      doc.switchToPage(page);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666666")
        .text(
          `Generated by Temple Management System  |  Page ${page + 1} of ${range.count}`,
          left,
          doc.page.height - 25,
          {
            width: tableWidth,
            align: "center",
            lineBreak: false,
          },
        );
    }

    doc.end();
  });
}