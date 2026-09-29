import fs from "fs"
import path from "path"

import type { HundiDetail } from "./hundiTypes"

import { amountInWords } from "../../utils/pdf/amountInWords"
import {
  LEFT,
  WIDTH,
  ensureSpace,
  formatCurrency,
  formatDate,
  formatNumber,
  keyValueGrid,
  noteBand,
  paragraph,
  renderReceipt,
  sectionTitle,
  signatures,
  table,
  totalsBox,
} from "../../utils/pdf/receiptLayout"

export interface HundiReceiptContext {
  hundi: HundiDetail
  imagePath: string | null
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"])

export function generateHundiReceiptPdf(ctx: HundiReceiptContext): Promise<Buffer> {
  const { hundi, imagePath } = ctx
  const noteTotal = hundi.denominations.filter((row) => row.type === "note").reduce((sum, row) => sum + Number(row.total_amount), 0)
  const coinTotal = hundi.denominations.filter((row) => row.type === "coin").reduce((sum, row) => sum + Number(row.total_amount), 0)
  const cashTotal = noteTotal + coinTotal
  const witnessAddress = [hundi.witness_address_line1, hundi.witness_address_line2, hundi.witness_city]
    .filter((part) => part && String(part).trim())
    .join(", ")
  const showImage = !!imagePath && fs.existsSync(imagePath) && IMAGE_EXTENSIONS.has(path.extname(imagePath).toLowerCase())

  return renderReceipt(
    {
      organizationName: hundi.temp_name || "Temple",
      title: "Hundi Opening Receipt",
      meta: [
        { label: "Receipt No", value: `HUN-${String(hundi.id).padStart(5, "0")}` },
        { label: "Hundi", value: `${hundi.hundi_number} - ${hundi.hundi_name}` },
        { label: "Deity", value: hundi.deity_name },
        { label: "Opened At", value: formatDate(hundi.opened_at, true) },
      ],
      footerNote: "This is a system-generated hundi opening receipt.",
    },
    (doc) => {
      sectionTitle(doc, "Witness Details")
      keyValueGrid(doc, [
        { label: "Full Name", value: hundi.witness_full_name },
        { label: "Designation", value: hundi.witness_designation ?? "" },
        { label: "Phone", value: hundi.witness_phone ?? "" },
        { label: "Email", value: hundi.witness_email ?? "" },
        { label: "Address", value: witnessAddress },
        { label: "Remarks", value: hundi.witness_remarks ?? "" },
      ])

      if (hundi.denominations.length) {
        sectionTitle(doc, "Cash Denominations")
        table(
          doc,
          [
            { label: "#", width: 28 },
            { label: "Type", width: 110 },
            { label: "Denomination", width: 137, align: "right" },
            { label: "Count", width: 110, align: "right" },
            { label: "Amount", width: 130, align: "right" },
          ],
          hundi.denominations.map((row, index) => [
            String(index + 1),
            row.type === "note" ? "Note" : "Coin",
            formatCurrency(Number(row.denomination)),
            formatNumber(Number(row.quantity)),
            formatCurrency(Number(row.total_amount)),
          ]),
        )
        totalsBox(doc, [
          { label: "Notes Total", value: formatCurrency(noteTotal) },
          { label: "Coins Total", value: formatCurrency(coinTotal) },
          { label: "Total Cash", value: formatCurrency(cashTotal), emphasis: true },
        ])
        noteBand(doc, "In Words", amountInWords(cashTotal))
      }

      if (hundi.items.length) {
        sectionTitle(doc, "Physical Items")
        table(
          doc,
          [
            { label: "#", width: 28 },
            { label: "Item", width: 167 },
            { label: "Qty", width: 50, align: "right" },
            { label: "Measurement", width: 100 },
            { label: "Approx. Value", width: 85, align: "right" },
            { label: "Exact Value", width: 85, align: "right" },
          ],
          hundi.items.map((item, index) => [
            String(index + 1),
            item.item_name,
            formatNumber(Number(item.quantity)),
            item.measurement_weight ? `${formatNumber(Number(item.measurement_weight))} ${item.measurement ?? ""}`.trim() : "-",
            item.approximate_value ? formatCurrency(Number(item.approximate_value)) : "-",
            item.exact_value ? formatCurrency(Number(item.exact_value)) : "-",
          ]),
        )
      }

      if (hundi.summary) {
        sectionTitle(doc, "Summary")
        paragraph(doc, hundi.summary)
      }

      keyValueGrid(doc, [{ label: "Remarks", value: hundi.general_remark ?? "" }], 1)

      if (showImage && imagePath) {
        ensureSpace(doc, 320)
        sectionTitle(doc, "Hundi Photo")
        doc.image(imagePath, LEFT, doc.y, { fit: [WIDTH, 280], align: "center" })
        doc.y += 292
      }

      sectionTitle(doc, "Witness Signatures")
      table(
        doc,
        [
          { label: "#", width: 28 },
          { label: "Witness Name", width: 187 },
          { label: "Designation", width: 120 },
          { label: "Signature", width: 180 },
        ],
        [hundi, ...hundi.extra_witnesses].map((witness, index) => [
          String(index + 1),
          witness.witness_full_name,
          witness.witness_designation ?? "-",
          " ",
        ]),
        40,
      )

      signatures(doc, [{ title: "Authorized Signatory" }])
    },
  )
}
