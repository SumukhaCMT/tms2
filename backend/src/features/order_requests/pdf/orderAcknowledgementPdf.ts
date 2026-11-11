import type { RowDataPacket } from "mysql2/promise"

import { amountInWords } from "../../../utils/pdf/amountInWords"
import {
  formatCurrency,
  formatDate,
  keyValueGrid,
  noteBand,
  renderReceipt,
  sectionTitle,
  signatures,
  table,
  totalsBox,
} from "../../../utils/pdf/receiptLayout"

const titleCase = (value: string | null) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : ""

const text = (value: unknown) => (value === null || value === undefined ? "" : String(value))

export function generateOrderAcknowledgementPdf(order: RowDataPacket): Promise<Buffer> {
  const items = order.items as RowDataPacket[]
  const isManual = order.payment_method === "manual"
  const grandTotal = Number(order.grand_total)
  const address = [
    order.billing_address_line1,
    order.billing_address_line2,
    order.billing_city,
    order.billing_state,
    order.billing_pincode,
    order.billing_country,
  ]
    .filter((part) => part && String(part).trim())
    .join(", ")

  return renderReceipt(
    {
      organizationName: "TMS Software",
      subtitle: "Temple Management",
      title: "Order Acknowledgement",
      meta: [
        { label: "Order No", value: text(order.order_number) },
        { label: "Order Date", value: formatDate(order.created_at) },
        { label: "Order Status", value: titleCase(order.order_status) },
        { label: "Payment Status", value: titleCase(order.payment_status) },
      ],
    },
    (doc) => {
      sectionTitle(doc, "Billed To")
      keyValueGrid(doc, [
        { label: "Organization", value: text(order.organization_name) },
        { label: "Billing Name", value: text(order.billing_name) },
        { label: "GST Number", value: text(order.billing_gst_number) },
        { label: "Email", value: text(order.billing_email) },
        { label: "Phone", value: text(order.billing_phone) },
        { label: "Placed By", value: text(order.placed_by_name) },
        { label: "Address", value: address },
      ])

      sectionTitle(doc, "Order Items")
      table(
        doc,
        [
          { label: "#", width: 24 },
          { label: "Item", width: 140 },
          { label: "License", width: 65 },
          { label: "Period", width: 110 },
          { label: "Price", width: 60, align: "right" },
          { label: "GST", width: 46, align: "right" },
          { label: "Total", width: 70, align: "right" },
        ],
        items.map((item, index) => [
          String(index + 1),
          `${item.item_name}\n${titleCase(item.item_type)}${item.item_code ? ` · ${item.item_code}` : ""}`,
          titleCase(item.license_type),
          item.end_date ? `${formatDate(item.start_date)} to ${formatDate(item.end_date)}` : `From ${formatDate(item.start_date)}`,
          formatCurrency(Number(item.unit_price)),
          `${Number(item.gst_percentage)}%`,
          formatCurrency(Number(item.line_total)),
        ]),
      )

      totalsBox(doc, [
        { label: "Subtotal", value: formatCurrency(Number(order.subtotal)) },
        { label: "GST", value: formatCurrency(Number(order.total_gst_amount)) },
        { label: "Grand Total", value: formatCurrency(grandTotal), emphasis: true },
      ])
      noteBand(doc, "In Words", amountInWords(grandTotal))

      sectionTitle(doc, "Payment Details")
      keyValueGrid(doc, [
        { label: "Payment Method", value: titleCase(order.payment_method) },
        ...(isManual
          ? [
              { label: "Payment Mode", value: titleCase(order.manual_payment_mode) },
              { label: "Reference No", value: text(order.manual_payment_reference) },
              { label: "Payment Date", value: order.manual_payment_date ? formatDate(order.manual_payment_date) : "" },
              { label: "Recorded By", value: text(order.manual_payment_recorded_by_name) },
            ]
          : [
              { label: "Gateway", value: titleCase(order.payment_gateway) },
              { label: "Gateway Order ID", value: text(order.gateway_order_id) },
              { label: "Gateway Payment ID", value: text(order.gateway_payment_id) },
            ]),
        { label: "Paid At", value: order.paid_at ? formatDate(order.paid_at, true) : "" },
      ])

      keyValueGrid(doc, [{ label: "Remarks", value: text(order.note) }], 1)

      signatures(doc, [{ title: "Authorized Signatory" }])
    },
  )
}
