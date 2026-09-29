import fs from "fs"
import path from "path"

export const INVENTORY_RECEIPTS_DIR = path.join(process.cwd(), "storage", "inventory-receipts")

export function ensureInventoryReceiptsDir(): void {
  fs.mkdirSync(INVENTORY_RECEIPTS_DIR, { recursive: true })
}

export function inventoryReceiptFileName(inventoryId: number): string {
  return `inventory-${inventoryId}.pdf`
}

export function inventoryReceiptFilePath(inventoryId: number): string {
  return path.join(INVENTORY_RECEIPTS_DIR, inventoryReceiptFileName(inventoryId))
}
