import fs from "fs"
import path from "path"

// Generated donation-acknowledgement PDFs are stored on disk (not in the
// DB) under <backend project root>/storage/receipts, named
// donation-<id>.pdf. Only the filename is stored on the `donations` row
// (see donationRepository.setDonationReceiptPath) - never a caller-
// supplied path - so there's no path-traversal surface on the way back
// out either.

export const RECEIPTS_DIR = path.join(process.cwd(), "storage", "receipts")

export function ensureReceiptsDir(): void {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true })
}

export function receiptFileName(donationId: number): string {
  return `donation-${donationId}.pdf`
}

export function receiptFilePath(donationId: number): string {
  return path.join(RECEIPTS_DIR, receiptFileName(donationId))
}
