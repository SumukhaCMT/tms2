
import path from "node:path";
import { randomUUID } from "node:crypto";

export function generateImageName(
  entityName: string,
  originalFileName: string,
): string {
  const extension = path.extname(originalFileName).toLowerCase();

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  if (!allowedExtensions.includes(extension)) {
    throw new Error("Unsupported image extension");
  }

  const safeName = entityName
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30) || "image";

  const uniqueId = randomUUID().replace(/-/g, "").slice(0, 8);

  // Fits within VARCHAR(50), including the extension.
  return `${safeName}-${uniqueId}${extension}`;
}
