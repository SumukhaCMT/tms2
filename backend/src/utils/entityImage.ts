import fs from "fs"
import path from "path"
import type { Request, Response } from "express"
import type { RowDataPacket } from "mysql2/promise"

import db from "../config/database"

interface EntityImageConfig {
  table: "temples" | "deities"
  column: "temp_img_name" | "deity_img_name"
  folder: string
  prefix: string
  label: string
}

interface ImageRow extends RowDataPacket {
  image: string | null
}

export function entityImageHandlers({ table, column, folder, prefix, label }: EntityImageConfig) {
  const directory = path.join(process.cwd(), "storage", folder)
  const fileNamePattern = new RegExp(`^${prefix}-\\d+-\\d+\\.webp$`)

  const filePath = (fileName: string) => path.join(directory, fileName)

  const storedFile = (fileName: string | null) =>
    fileName && fileNamePattern.test(fileName) && fs.existsSync(filePath(fileName)) ? filePath(fileName) : null

  const removeFile = (fileName: string | null) => {
    const existing = storedFile(fileName)
    if (existing) fs.unlinkSync(existing)
  }

  async function findImage(req: Request, res: Response) {
    const id = Number(req.params.id)
    const organizationId = Number(req.user?.organization_id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: `Invalid ${label.toLowerCase()} ID` })
      return null
    }

    if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
      res.status(403).json({ success: false, message: "Organization not found" })
      return null
    }

    const [rows] = await db.execute<ImageRow[]>(
      `SELECT ${column} AS image FROM ${table} WHERE id = ? AND organization_id = ? AND deleted_at IS NULL LIMIT 1`,
      [id, organizationId],
    )

    if (!rows.length) {
      res.status(404).json({ success: false, message: `${label} not found` })
      return null
    }

    return { id, organizationId, image: rows[0].image }
  }

  async function saveImageName(id: number, organizationId: number, fileName: string | null) {
    await db.execute(`UPDATE ${table} SET ${column} = ? WHERE id = ? AND organization_id = ?`, [fileName, id, organizationId])
  }

  async function getImage(req: Request, res: Response) {
    const record = await findImage(req, res)
    if (!record) return

    const file = storedFile(record.image)
    if (!file) {
      res.status(404).json({ success: false, message: "Image not found" })
      return
    }

    res.setHeader("Cache-Control", "no-store")
    res.sendFile(file)
  }

  async function uploadImage(req: Request, res: Response) {
    const record = await findImage(req, res)
    if (!record) return

    if (!req.file) {
      res.status(400).json({ success: false, message: "Image is required" })
      return
    }

    const fileName = `${prefix}-${record.id}-${Date.now()}.webp`

    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(filePath(fileName), req.file.buffer)

    try {
      await saveImageName(record.id, record.organizationId, fileName)
    } catch (error) {
      removeFile(fileName)
      throw error
    }

    if (record.image !== fileName) removeFile(record.image)

    res.status(200).json({ success: true, message: `${label} image uploaded successfully`, data: { file_name: fileName } })
  }

  async function deleteImage(req: Request, res: Response) {
    const record = await findImage(req, res)
    if (!record) return

    await saveImageName(record.id, record.organizationId, null)
    removeFile(record.image)

    res.status(200).json({ success: true, message: `${label} image removed successfully` })
  }

  return { getImage, uploadImage, deleteImage }
}
