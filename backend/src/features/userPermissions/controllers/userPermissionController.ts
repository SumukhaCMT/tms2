import type { Request, Response } from "express"

import { HttpError } from "../../../utils/httpError"

import { userPermissionsSchema } from "../validations/userPermissionValidation"
import { getUserPermissionsService, updateUserPermissionsService } from "../services/userPermissionService"

const organizationId = (req: Request) => Number(req.user?.organization_id)

const adminPermissions = (req: Request) => req.user?.permissions ?? {}

const userId = (req: Request) => {
  const id = Number(req.params.userId)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid user ID")
  return id
}

export const getUserPermissions = async (req: Request, res: Response) => {
  res.json({ success: true, data: await getUserPermissionsService(organizationId(req), userId(req), adminPermissions(req)) })
}

export const putUserPermissions = async (req: Request, res: Response) => {
  const result = userPermissionsSchema.safeParse(req.body)
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid input")
  await updateUserPermissionsService(organizationId(req), userId(req), adminPermissions(req), result.data.permissions)
  res.json({ success: true, message: "Permissions updated successfully" })
}
