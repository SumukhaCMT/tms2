import type { Request, Response } from "express"

import * as subModuleService from "../services/subModuleService"

export const createSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await subModuleService.create(req.body)

  res.status(201).json({
    success: true,
    message: "Sub module created successfully",
    data: result,
  })
}

export const getSubModules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const moduleIdParam = req.query.module_id

  const moduleId =
    typeof moduleIdParam === "string"
      ? Number(moduleIdParam)
      : undefined

  const result = await subModuleService.getAll(moduleId)

  res.status(200).json({
    success: true,
    data: result,
  })
}
export const getSubModuleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id)

  const result = await subModuleService.getById(id)

  res.status(200).json({
    success: true,
    data: result,
  })
}

export const updateSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id)

  const result = await subModuleService.update(
    id,
    req.body,
  )

  res.status(200).json({
    success: true,
    message: "Sub module updated successfully",
    data: result,
  })
}

export const deleteSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id)

  await subModuleService.remove(id)

  res.status(200).json({
    success: true,
    message: "Sub module deleted successfully",
  })
}