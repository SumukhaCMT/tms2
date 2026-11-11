import type { Request, Response } from "express"
import { findUniqueField, validateUnique } from "../services/validationService"

export const checkUnique = async (req: Request, res: Response) => {
  const entity = String(req.query.entity ?? "")
  const field = String(req.query.field ?? "")

  if (!findUniqueField(entity, field)) {
    return res.status(400).json({ success: false, message: "Unsupported validation field" })
  }

  const data = await validateUnique({
    entity,
    field,
    value: String(req.query.value ?? ""),
    excludeId: Number(req.query.excludeId) || undefined,
    organizationId: req.user?.organization_id || undefined,
  })

  return res.json({ success: true, data })
}
