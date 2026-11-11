import path from "path"
import type { NextFunction, Request, Response } from "express"
import decodeHeic from "heic-decode"
import multer from "multer"
import sharp from "sharp"

import { HttpError } from "./httpError"

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

type ImageFormat = "jpeg" | "png" | "webp" | "heic"

const MAX_DIMENSION = 10000
const MAX_PIXELS = 40_000_000

const MIME_FORMATS: Record<string, ImageFormat> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heic",
}

const HEIC_BRANDS = new Set(["heic", "heix", "heim", "heis", "hevc", "hevx"])

const HEIC_EXTENSIONS = new Set([".heic", ".heif"])

const TEXT_SIGNATURES = ["<?php", "<script", "<iframe", "<html", "<object", "<embed", "javascript:", "vbscript:", "eval(", "base64_decode", "document.cookie", "powershell"]

const BINARY_SIGNATURES = ["%PDF-", "\x7fELF\x01", "\x7fELF\x02", "PK\x03\x04\x14\x00", "PK\x03\x04\x0a\x00", "Rar!\x1a\x07", "7z\xbc\xaf\x27\x1c", "MZ\x90\x00\x03\x00"]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
})

function reject(message: string): never {
  throw new HttpError(400, message)
}

function detectFormat(buffer: Buffer): ImageFormat | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg"
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png"
  if (buffer.length >= 12 && buffer.toString("latin1", 0, 4) === "RIFF" && buffer.toString("latin1", 8, 12) === "WEBP") return "webp"
  if (isHeic(buffer)) return "heic"
  return null
}

function isHeic(buffer: Buffer): boolean {
  if (buffer.length < 16 || buffer.toString("latin1", 4, 8) !== "ftyp") return false

  const boxSize = Math.min(buffer.readUInt32BE(0), buffer.length)
  const brands = [buffer.toString("latin1", 8, 12)]

  for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
    brands.push(buffer.toString("latin1", offset, offset + 4))
  }

  return brands.some((brand) => HEIC_BRANDS.has(brand))
}

function isStandaloneMarker(marker: number): boolean {
  return marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)
}

function jpegEnd(buffer: Buffer): number {
  let offset = 2

  while (offset + 1 < buffer.length) {
    if (buffer[offset] !== 0xff) return -1

    let marker = buffer[offset + 1]
    while (marker === 0xff && offset + 2 < buffer.length) {
      offset += 1
      marker = buffer[offset + 1]
    }

    if (marker === 0xd9) return offset + 2

    if (isStandaloneMarker(marker)) {
      offset += 2
      continue
    }

    if (offset + 4 > buffer.length) return -1

    const length = buffer.readUInt16BE(offset + 2)
    if (length < 2) return -1

    offset += 2 + length
    if (offset > buffer.length) return -1

    if (marker === 0xda) {
      while (offset + 1 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1
          continue
        }

        const next = buffer[offset + 1]
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
          offset += 2
          continue
        }

        if (next === 0xff) {
          offset += 1
          continue
        }

        break
      }
    }
  }

  return -1
}

function pngEnd(buffer: Buffer): number {
  let offset = 8

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString("latin1", offset + 4, offset + 8)
    const next = offset + 12 + length

    if (next > buffer.length) return -1
    if (type === "IEND") return next

    offset = next
  }

  return -1
}

function webpEnd(buffer: Buffer): number {
  const size = buffer.readUInt32LE(4)
  const end = 8 + size + (size % 2)
  return end > buffer.length ? -1 : end
}

function heicEnd(buffer: Buffer): number {
  let offset = 0

  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32BE(offset)
    let boxSize = size

    if (size === 0) return buffer.length

    if (size === 1) {
      if (offset + 16 > buffer.length) return -1
      const largeSize = buffer.readBigUInt64BE(offset + 8)
      if (largeSize > BigInt(buffer.length - offset)) return -1
      boxSize = Number(largeSize)
    }

    if (boxSize < 8 || offset + boxSize > buffer.length) return -1

    offset += boxSize
  }

  return offset
}

function imageEnd(buffer: Buffer, format: ImageFormat): number {
  if (format === "jpeg") return jpegEnd(buffer)
  if (format === "png") return pngEnd(buffer)
  if (format === "heic") return heicEnd(buffer)
  return webpEnd(buffer)
}

function streamEnd(buffer: Buffer, format: ImageFormat): number {
  let end = imageEnd(buffer, format)

  while (format === "jpeg" && end > 0 && detectFormat(buffer.subarray(end)) === "jpeg") {
    const next = jpegEnd(buffer.subarray(end))
    if (next < 0) return -1
    end += next
  }

  return end
}

function assertNoHiddenData(buffer: Buffer, format: ImageFormat) {
  const end = streamEnd(buffer, format)

  if (end < 0) reject("Image structure is invalid or the file is incomplete.")

  const trailing = buffer.subarray(end)
  const isPadding = trailing.every((byte) => byte === 0x00 || (format === "jpeg" && byte === 0xff))

  if (!isPadding) reject("Hidden data was found inside the image. Please upload a clean image.")
}

function assertNoEmbeddedCode(buffer: Buffer) {
  const raw = buffer.toString("latin1")
  const lower = raw.toLowerCase()

  if (TEXT_SIGNATURES.some((signature) => lower.includes(signature)) || BINARY_SIGNATURES.some((signature) => raw.includes(signature))) {
    reject("Suspicious code or an embedded file was found inside the image. Please upload a clean image.")
  }
}

async function heicToWebp(buffer: Buffer): Promise<Buffer> {
  try {
    const { width, height, data } = await decodeHeic({ buffer })

    if (!width || !height) reject("Image dimensions could not be read.")
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) reject(`Image dimensions must not exceed ${MAX_DIMENSION} x ${MAX_DIMENSION} pixels.`)

    return await sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
      raw: { width, height, channels: 4 },
      limitInputPixels: MAX_PIXELS,
    })
      .webp({ quality: 85 })
      .toBuffer()
  } catch (error) {
    if (error instanceof HttpError) throw error
    return reject("Image is corrupted or could not be processed.")
  }
}

export async function sanitizeImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
  const declared = MIME_FORMATS[mimetype.toLowerCase()]
  if (!declared) reject("Only PNG, JPG, WEBP or HEIC images are allowed.")
  if (buffer.length === 0) reject("The uploaded image is empty.")
  if (buffer.length > MAX_IMAGE_SIZE) reject("Maximum file size is 5 MB.")

  const format = detectFormat(buffer)
  if (!format) reject("The file is not a valid PNG, JPG, WEBP or HEIC image.")
  if (format !== declared) reject("Image content does not match its file type.")

  assertNoHiddenData(buffer, format)
  assertNoEmbeddedCode(buffer)

  if (format === "heic") return heicToWebp(buffer)

  try {
    const metadata = await sharp(buffer, { limitInputPixels: MAX_PIXELS }).metadata()

    if (metadata.format !== format) reject("Image content does not match its file type.")
    if (!metadata.width || !metadata.height) reject("Image dimensions could not be read.")
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) reject(`Image dimensions must not exceed ${MAX_DIMENSION} x ${MAX_DIMENSION} pixels.`)
    if ((metadata.pages ?? 1) > 1) reject("Animated or multi-page images are not allowed.")

    return await sharp(buffer, { limitInputPixels: MAX_PIXELS, failOn: "error", autoOrient: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch (error) {
    if (error instanceof HttpError) throw error
    return reject("Image is corrupted or could not be processed.")
  }
}

function uploadErrorMessage(error: unknown): string {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") return "Maximum file size is 5 MB."
    if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") return "Only one image can be uploaded."
  }
  return "Image upload failed."
}

function resolveMimetype(file: Express.Multer.File): string {
  const mimetype = file.mimetype.toLowerCase()
  if (MIME_FORMATS[mimetype]) return mimetype
  return HEIC_EXTENSIONS.has(path.extname(file.originalname).toLowerCase()) ? "image/heic" : mimetype
}

export function secureImageUpload(field: string) {
  const single = upload.single(field)

  return (req: Request, res: Response, next: NextFunction) => {
    single(req, res, (error: unknown) => {
      if (error) {
        res.status(400).json({ success: false, message: uploadErrorMessage(error) })
        return
      }

      const file = req.file
      if (!file) {
        next()
        return
      }

      sanitizeImage(file.buffer, resolveMimetype(file))
        .then((webp) => {
          file.buffer = webp
          file.mimetype = "image/webp"
          file.size = webp.length
          file.originalname = `${file.originalname.replace(/\.[^.]*$/, "")}.webp`
          next()
        })
        .catch((sanitizeError: unknown) => {
          res.status(sanitizeError instanceof HttpError ? sanitizeError.status : 400).json({
            success: false,
            message: sanitizeError instanceof Error ? sanitizeError.message : "Invalid image.",
          })
        })
    })
  }
}
