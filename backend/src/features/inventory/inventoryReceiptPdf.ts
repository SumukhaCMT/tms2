import type { InventoryGroup, InventoryGroupItem } from "./inventoryTypes"

import {
  formatDate,
  formatNumber,
  ensureSpace,
  keyValueGrid,
  renderReceipt,
  sectionTitle,
  signatures,
  table,
  totalsBox,
} from "../../utils/pdf/receiptLayout"
import { getTempleContact } from "../../utils/pdf/templeContact"

function itemTotal(item: InventoryGroupItem): number {
  return Number(item.stock_quantity) * (Number(item.measurement) || 1)
}

function totalsByUnit(items: InventoryGroupItem[]) {
  const totals = new Map<string, number>()
  for (const item of items) {
    const unit = item.unit_name ?? ""
    totals.set(unit, (totals.get(unit) ?? 0) + itemTotal(item))
  }
  return [...totals].map(([unit, total]) => ({ label: `Total ${unit || "Units"}`, value: `${formatNumber(total)} ${unit}`.trim() }))
}

export async function generateInventoryReceiptPdf(group: InventoryGroup): Promise<Buffer> {
  const receiptNo = `INV-${String(group.items[0]?.id ?? group.id).padStart(5, "0")}`
  const itemType = group.item_type === "consumable" ? "Consumable" : "Non Consumable"
  const totalQuantity = group.items.reduce((sum, item) => sum + Number(item.stock_quantity), 0)

  const contact = await getTempleContact(group.temple_id)

  return renderReceipt(
    {
      contact,
      organizationName: group.temp_name || "Temple",
      subtitle: "Inventory Management / Goods Received",
      title: "Receipt",
      meta: [
        { label: "Receipt No", value: receiptNo },
        { label: "Received On", value: formatDate(group.given_at, true) },
        { label: "Item Type", value: itemType },
        { label: "Total Items", value: String(group.items.length) },
      ],
    },
    (doc) => {
      sectionTitle(doc, "Received From")
      keyValueGrid(doc, [
        { label: "Given By", value: group.given_by ?? "" },
        { label: "Received On", value: formatDate(group.given_at, true) },
        { label: "Received At", value: group.temp_name },
        { label: "Item Type", value: itemType },
      ])

      sectionTitle(doc, "Storage & Record")
      keyValueGrid(doc, [
        { label: "Stored at", value: group.stored_at ?? "" },
        { label: "Recorded By", value: group.created_by_name ?? "" },
      ])
      keyValueGrid(doc, [{ label: "Remarks", value: group.remarks ?? "" }], 1)

      sectionTitle(doc, "Items Received")
      table(
        doc,
        [
          { label: "#", width: 28 },
          { label: "Item", width: 140 },
          { label: "Stock Qty", width: 80, align: "right" },
          { label: "Unit", width: 80 },
          { label: "Per Unit", width: 72, align: "right" },
          { label: "Total", width: 115, align: "right" },
        ],
        group.items.map((item, index) => [
          String(index + 1),
          item.item_name,
          formatNumber(Number(item.stock_quantity)),
          item.unit_name ?? "-",
          item.measurement ? formatNumber(Number(item.measurement)) : "-",
          `${formatNumber(itemTotal(item))} ${item.unit_name ?? ""}`.trim(),
        ]),
      )

      ensureSpace(doc, 170)
      sectionTitle(doc, "Stock Summary")
      totalsBox(doc, [
        { label: "Total Items", value: String(group.items.length) },
        { label: "Total Stock Qty", value: formatNumber(totalQuantity) },
        ...totalsByUnit(group.items),
      ])

      signatures(doc, [{ title: "Authorized Signatory" }])
    },
  )
}
