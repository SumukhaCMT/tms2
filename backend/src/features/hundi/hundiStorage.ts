import fs from "fs"
import path from "path"

// Generated hundi-receipt PDFs and uploaded signed-receipt PDFs are stored
// on disk under <backend project root>/storage. Hundi photos are stored as
// binary in the `hundi_image` table (see hundiRepository.setHundiImageData).

export const HUNDI_RECEIPTS_DIR = path.join(process.cwd(), "storage", "hundi-receipts")
export const HUNDI_SIGNED_RECEIPTS_DIR = path.join(process.cwd(), "storage", "hundi-signed-receipts")

export function ensureHundiReceiptsDir(): void {
  fs.mkdirSync(HUNDI_RECEIPTS_DIR, { recursive: true })
}

export function ensureHundiSignedReceiptsDir(): void {
  fs.mkdirSync(HUNDI_SIGNED_RECEIPTS_DIR, { recursive: true })
}

export function hundiReceiptFileName(hundiId: number): string {
  return `hundi-${hundiId}.pdf`
}

export function hundiReceiptFilePath(hundiId: number): string {
  return path.join(HUNDI_RECEIPTS_DIR, hundiReceiptFileName(hundiId))
}

export function hundiSignedReceiptFileName(hundiId: number): string {
  return `hundi-signed-${hundiId}-${Date.now()}.pdf`
}

export function hundiSignedReceiptFilePath(fileName: string): string {
  return path.join(HUNDI_SIGNED_RECEIPTS_DIR, fileName)
}
