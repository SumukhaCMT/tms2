import type { Request, Response } from "express"

import { systemDefaultsService } from "../services/systemDefaultsService"

import {
  validateCreateSystemDefault,
  validateUpdateSystemDefault,
} from "../validation/systemDefaultsValidation"

export const systemDefaultsController = {
  async getAll(
    req: Request,
    res: Response,
  ) {
    try {
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 10)

      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : ""

      const result =
        await systemDefaultsService.getAll({
          page,
          limit,
          search,
        })

      const totalPages =
        Math.ceil(result.total / limit)

      return res.status(200).json({
        success: true,
        message:
          "System defaults fetched successfully",
        data: result.rows,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch system defaults",
      })
    }
  },

  async getById(
    req: Request,
    res: Response,
  ) {
    try {
      const id = Number(req.params.id)

      const data =
        await systemDefaultsService.getById(id)

      return res.status(200).json({
        success: true,
        message:
          "System default fetched successfully",
        data,
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "System default not found",
      })
    }
  },

  


async getByKey(
  req: Request,
  res: Response,
) {
  try {
    const { key } = req.params

    if (typeof key !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid system default key",
      })
    }

    const data =
      await systemDefaultsService.getByKey(key)

    return res.status(200).json({
      success: true,
      message:
        "System default fetched successfully",
      data,
    })
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "System default not found",
    })
  }
},



  async create(
    req: Request,
    res: Response,
  ) {
    try {
      validateCreateSystemDefault(req.body)

      await systemDefaultsService.create(
        req.body,
      )

      return res.status(201).json({
        success: true,
        message:
          "System default created successfully",
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create system default",
      })
    }
  },

  async update(
    req: Request,
    res: Response,
  ) {
    try {
      const id = Number(req.params.id)

      validateUpdateSystemDefault(req.body)

      await systemDefaultsService.update(
        id,
        req.body,
      )

      return res.status(200).json({
        success: true,
        message:
          "System default updated successfully",
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update system default",
      })
    }
  },

  async delete(
    req: Request,
    res: Response,
  ) {
    try {
      const id = Number(req.params.id)

      await systemDefaultsService.delete(id)

      return res.status(200).json({
        success: true,
        message:
          "System default deleted successfully",
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete system default",
      })
    }
  },



  
}