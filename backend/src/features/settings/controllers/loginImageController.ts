import type { Request, Response } from "express"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

import db from "../../../config/database"

export const loginImageController = {
  async get(_req: Request, res: Response) {
    const [rows] = await db.execute<(RowDataPacket & { image: Buffer })[]>(
      "SELECT image FROM hundi_image WHERE hundi_id IS NULL ORDER BY id DESC LIMIT 1",
    )

    if (!rows.length) {
      res.status(404).json({ success: false, message: "Login image not found" })
      return
    }

    res.setHeader("Cache-Control", "no-store")
    res.type("image/webp").send(rows[0].image)
  },

  async upload(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Image is required" })
      return
    }

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE hundi_image SET image = ? WHERE hundi_id IS NULL",
      [req.file.buffer],
    )

    if (!result.affectedRows) {
      await db.execute("INSERT INTO hundi_image (hundi_id, image) VALUES (NULL, ?)", [req.file.buffer])
    }

    res.status(200).json({ success: true, message: "Login image uploaded successfully" })
  },

  async remove(_req: Request, res: Response) {
    await db.execute("DELETE FROM hundi_image WHERE hundi_id IS NULL")

    res.status(200).json({ success: true, message: "Login image removed successfully" })
  },
}
