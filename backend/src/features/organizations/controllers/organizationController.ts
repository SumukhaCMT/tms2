

import type {
  Request,
  Response,
  NextFunction,
} from "express"
import db from "../../../config/database"
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validations/organizationValidation"

import {
  organizationService,
} from "../services/organizationService"

// ============================================================
// GET ERROR MESSAGE
// ============================================================

function getErrorMessage(
  error: unknown,
) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(
      (
        error as {
          message: unknown
        }
      ).message,
    )
  }

  return "Server error"
}

// ============================================================
// ORGANIZATION CONTROLLER
// ============================================================

export const organizationController = {
  // ============================================================
  // GET ALL ORGANIZATIONS
  // GET /api/v1/organizations
  // ============================================================

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data =
        await organizationService.getAll()

      return res.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  },

  // ============================================================
  // GET ORGANIZATION BY ID
  // GET /api/v1/organizations/:id
  //
  // Returns:
  // organization
  // temples
  // users
  // subscriptions
  // orders
  // order items
  // ============================================================

  async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const id = Number(req.params.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid organization ID",
      })
    }

    const conn =
      await db.getConnection()

    try {
      const data =
        await organizationService.findById(
          conn,
          id,
        )

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Organization not found",
        })
      }

      return res.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      console.error(
        "Find organization by ID error:",
        error,
      )

      next(error)
    } finally {
      conn.release()
    }
  },

  // ============================================================
  // CREATE ORGANIZATION
  // POST /api/v1/organizations
  // ============================================================

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation =
        createOrganizationSchema.safeParse(
          req.body,
        )

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            "Validation failed",
          errors:
            validation.error.flatten(),
        })
      }

      const data =
        await organizationService.create(
          validation.data,
        )

      return res.status(201).json({
        success: true,
        message:
          "Organization created successfully",
        data,
      })
    } catch (error) {
      const message =
        getErrorMessage(error)

      if (
        message.includes(
          "already exists",
        )
      ) {
        return res.status(400).json({
          success: false,
          message,
        })
      }

      next(error)
    }
  },

  // ============================================================
  // UPDATE ORGANIZATION
  // PUT /api/v1/organizations/:id
  // ============================================================

  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id =
        Number(req.params.id)

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid organization ID",
        })
      }

      const validation =
        updateOrganizationSchema.safeParse(
          req.body,
        )

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            "Validation failed",
          errors:
            validation.error.flatten(),
        })
      }

      const data =
        await organizationService.update(
          id,
          validation.data,
        )

      return res.status(200).json({
        success: true,
        message:
          "Organization updated successfully",
        data,
      })
    } catch (error) {
      const message =
        getErrorMessage(error)

      if (
        message ===
        "Organization not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        })
      }

      if (
        message.includes(
          "already exists",
        )
      ) {
        return res.status(400).json({
          success: false,
          message,
        })
      }

      next(error)
    }
  },

  // ============================================================
  // DELETE ORGANIZATION
  // DELETE /api/v1/organizations/:id
  // ============================================================

  async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id =
        Number(req.params.id)

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid organization ID",
        })
      }

      await organizationService.remove(
        id,
      )

      return res.status(200).json({
        success: true,
        message:
          "Organization deleted successfully",
      })
    } catch (error) {
      const message =
        getErrorMessage(error)

      if (
        message ===
        "Organization not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        })
      }

      next(error)
    }
  },

  async updateSubscription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id =
      Number(req.params.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subscription ID",
      })
    }

    const {
      granted_quantity,
      remaining_quantity,
      start_date,
      expiry_date,
    } = req.body

    const data =
      await organizationService.updateSubscription(
        id,
        {
          granted_quantity:
            granted_quantity !== undefined
              ? Number(
                  granted_quantity,
                )
              : undefined,

          remaining_quantity:
            remaining_quantity !== undefined
              ? Number(
                  remaining_quantity,
                )
              : undefined,

          start_date:
            start_date || undefined,

          expiry_date:
            expiry_date !== undefined
              ? expiry_date
              : undefined,
        },
      )

    return res.status(200).json({
      success: true,
      message:
        "Subscription updated successfully",
      data,
    })
  } catch (error) {
    const message =
      getErrorMessage(error)

    if (
      message ===
      "Organization subscription not found"
    ) {
      return res.status(404).json({
        success: false,
        message,
      })
    }

    next(error)
  }
},
}

