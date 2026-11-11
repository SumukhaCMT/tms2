
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

export type ReceiptPrintType = "a4" | "thermal_80mm";

export interface ReceiptPrintItem {
  name: string;
  deity?: string | null;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ReceiptPrintData {
  receiptNumber:  string | null;
  organizationName: string;
  templeName: string;
  templeAddress?: string | null;
  templePhone?: string | null;
  receiptTitle?: string;
  date: string;
  paymentMethod:  string | null;
  items: ReceiptPrintItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  remark?: string | null;
}

interface TemplePrintRow extends RowDataPacket {
  receipt_print_type: ReceiptPrintType;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const formatINR = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export async function generateReceiptPrintHtml(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  data: ReceiptPrintData,
): Promise<{ printType: ReceiptPrintType; html: string }> {
  if (
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0 ||
    !Number.isSafeInteger(templeId) ||
    templeId <= 0
  ) {
    throw new Error("Invalid organization or temple");
  }

  const [temples] = await connection.execute<TemplePrintRow[]>(
    `SELECT receipt_print_type
     FROM temples
     WHERE id = ?
       AND organization_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [templeId, organizationId],
  );

  if (!temples.length) {
    throw new Error("Temple not found");
  }

  const printType: ReceiptPrintType =
    temples[0].receipt_print_type === "a4"
      ? "a4"
      : "thermal_80mm";

  const isA4 = printType === "a4";

  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            ${
              item.deity
                ? `<br><small>${escapeHtml(item.deity)}</small>`
                : ""
            }
          </td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatINR(item.rate)}</td>
          <td class="right">${formatINR(item.amount)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(data.receiptNumber)}</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    color: #111;
    margin: 0;
    padding: ${isA4 ? "20px" : "5px"};
    font-size: ${isA4 ? "14px" : "11px"};
  }

  .receipt {
    width: ${isA4 ? "100%" : "70mm"};
    max-width: 100%;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    border-bottom: 1px dashed #555;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }

  h2 {
    margin: 0 0 6px;
    font-size: ${isA4 ? "22px" : "17px"};
  }

  h3 {
    margin: 10px 0;
    text-align: center;
  }

  p {
    margin: 4px 0;
  }

  .meta {
    margin: 12px 0;
    line-height: 1.7;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }

  th, td {
    padding: ${isA4 ? "9px 5px" : "5px 2px"};
    border-bottom: 1px dashed #aaa;
    text-align: left;
    vertical-align: top;
  }

  th {
    font-size: 0.9em;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .totals {
    margin-top: 12px;
    margin-left: auto;
    width: ${isA4 ? "300px" : "100%"};
  }

  .totals div {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .grand-total {
    font-size: 1.15em;
    font-weight: bold;
    border-top: 1px solid #111;
    margin-top: 5px;
    padding-top: 8px !important;
  }

  .remark {
    margin-top: 15px;
    border-top: 1px dashed #aaa;
    padding-top: 8px;
  }

  .footer {
    text-align: center;
    margin-top: 25px;
    border-top: 1px dashed #555;
    padding-top: 10px;
  }

  @page {
    size: ${isA4 ? "A4 portrait" : "80mm auto"};
    margin: ${isA4 ? "12mm" : "3mm"};
  }

  @media print {
    body {
      padding: 0;
    }

    .receipt {
      width: ${isA4 ? "100%" : "70mm"};
    }
  }
</style>
</head>

<body>
<div class="receipt">

  <div class="header">
    <h2>${escapeHtml(data.templeName)}</h2>
    <p>${escapeHtml(data.organizationName)}</p>
    ${data.templeAddress ? `<p>${escapeHtml(data.templeAddress)}</p>` : ""}
    ${data.templePhone ? `<p>Phone: ${escapeHtml(data.templePhone)}</p>` : ""}
  </div>

  <h3>${escapeHtml(data.receiptTitle || "PAYMENT RECEIPT")}</h3>

  <div class="meta">
    <div><strong>Receipt No:</strong> ${escapeHtml(data.receiptNumber)}</div>
    <div><strong>Date:</strong> ${escapeHtml(data.date)}</div>
    <div><strong>Payment:</strong> ${escapeHtml(data.paymentMethod)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Particulars</th>
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div>
      <span>Subtotal</span>
      <strong>${formatINR(data.subtotal)}</strong>
    </div>
    <div>
      <span>GST</span>
      <strong>${formatINR(data.gstAmount)}</strong>
    </div>
    <div class="grand-total">
      <span>Total</span>
      <strong>${formatINR(data.totalAmount)}</strong>
    </div>
  </div>

  ${
    data.remark
      ? `<div class="remark"><strong>Remark:</strong> ${escapeHtml(data.remark)}</div>`
      : ""
  }

  <div class="footer">
    <p>Thank you. Visit Again!</p>
    <p><small>This is a computer-generated receipt.</small></p>
  </div>

</div>

<script>
  window.addEventListener("load", () => {
    window.focus();
    window.print();
  });
</script>

</body>
</html>`;

  return { printType, html };
}
