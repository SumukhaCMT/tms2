import fs from "fs"
import path from "path"

// Generated hundi-receipt PDFs, uploaded hundi photos and uploaded
// signed-receipt PDFs are stored on disk (not in the DB) under
// <backend project root>/storage — mirrors donations' receiptStorage.ts.
// Only the filename is ever stored on the `hundi` row (see
// hundiRepository.setHundiReceiptPath / setHundiImagePath /
// setSignedReceiptPath) — never a caller-supplied path.

export const HUNDI_RECEIPTS_DIR = path.join(process.cwd(), "storage", "hundi-receipts")
export const HUNDI_IMAGES_DIR = path.join(process.cwd(), "storage", "hundi-images")
export const HUNDI_SIGNED_RECEIPTS_DIR = path.join(process.cwd(), "storage", "hundi-signed-receipts")

export function ensureHundiReceiptsDir(): void {
  fs.mkdirSync(HUNDI_RECEIPTS_DIR, { recursive: true })
}

export function ensureHundiImagesDir(): void {
  fs.mkdirSync(HUNDI_IMAGES_DIR, { recursive: true })
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

export function hundiImageFilePath(fileName: string): string {
  return path.join(HUNDI_IMAGES_DIR, fileName)
}

export function hundiSignedReceiptFileName(hundiId: number): string {
  return `hundi-signed-${hundiId}-${Date.now()}.pdf`
}

export function hundiSignedReceiptFilePath(fileName: string): string {
  return path.join(HUNDI_SIGNED_RECEIPTS_DIR, fileName)
}
