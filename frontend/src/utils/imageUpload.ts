import { isAxiosError } from "axios"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"]

export const IMAGE_ACCEPT = [...IMAGE_TYPES, ".heic", ".heif"].join(",")

export function normalizeImageFile(file: File): File | null {
  if (IMAGE_TYPES.includes(file.type)) return file
  return /\.(heic|heif)$/i.test(file.name) ? new File([file], file.name, { type: "image/heic" }) : null
}

export interface ImageSelection {
  file: File | null
  removed: boolean
}

export function describeImage(file: File) {
  const type = file.type.split("/")[1]?.toUpperCase() ?? "FILE"
  const size = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`
  return `${type} · ${size}`
}

export function toWebpName(fileName: string) {
  return `${fileName.replace(/\.[^.]*$/, "") || "image"}.webp`
}

export async function imageErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (!isAxiosError(error)) return fallback

  const data: unknown = error.response?.data

  if (data instanceof Blob) {
    try {
      const parsed: unknown = JSON.parse(await data.text())
      return parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string" ? parsed.message : fallback
    } catch {
      return fallback
    }
  }

  return data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : fallback
}

export async function saveEntityImage(path: string, selection: ImageSelection) {
  if (selection.file) {
    const data = new FormData()
    data.append("image", selection.file)
    await api.post(path, data)
    return
  }

  if (selection.removed) await api.delete(path)
}

export async function persistEntityImage(path: string, selection: ImageSelection, label: string): Promise<boolean> {
  try {
    await saveEntityImage(path, selection)
    return true
  } catch (error) {
    showCmtToast("expiry", `${label} saved, but the image was not saved. ${await imageErrorMessage(error, "Please try again.")}`)
    return false
  }
}
