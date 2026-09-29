import type {
  Request,
  Response,
} from "express"

import {
  fetchModulesList,
  fetchModules,
    fetchModuleById,
  createModule,
  editModule,
  deleteModule,
  fetchModulesWithSubModules,
} from "../services/moduleService"

import { hasPermission } from "../../../permissions/permissions"

import type {
  CreateModuleData,
    UpdateModuleData,
} from "../modulesTypes"

import {
  getPaginationParams,
  getPaginationMeta,
} from "../../../utils/pagination"

// ============================
// Get Modules
// ============================

export const getModulesList = async (
  _req: Request,
  res: Response,
) => {
  try {
    const modulesList = await fetchModulesList()

    return res.status(200).json({
      success: true,
      data: modulesList,
    })
  } catch (error) {
    console.error(
      "GET MODULES ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// pagination and rate limit
export const getModules = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      page,
      limit,
      offset,
    } = getPaginationParams(
      req.query.page,
      req.query.limit,
    )

    const result = await fetchModules(
      limit,
      offset,
    )

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: getPaginationMeta(
        page,
        limit,
        result.total,
      ),
    })
  } catch (error) {
    console.error(
      "GET MODULES ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Get Module By ID
// ============================

export const getModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      })
    }

    const module = await fetchModuleById(id)

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: module,
    })
  } catch (error) {
    console.error(
      "GET MODULE ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Create Module
// ============================

export const postModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = req.body as CreateModuleData

    console.log(
      "CREATE MODULE BODY:",
      data,
    )

    const moduleId = await createModule(data)

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: {
        id: moduleId,
      },
    })
  } catch (error) {
    console.error(
      "CREATE MODULE ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}


// ============================
// Update Module
// ============================

export const putModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      })
    }

    const data = req.body as UpdateModuleData

    const existingModule = await fetchModuleById(id)

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      })
    }

    const updated = await editModule(
      id,
      data,
    )

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
    })
  } catch (error) {
    console.error(
      "UPDATE MODULE ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Soft Delete Module
// ============================

export const removeModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      })
    }

    const deleted = await deleteModule(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    })
  } catch (error) {
    console.error(
      "DELETE MODULE ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Get Modules With Sub-Modules (for sidebar nav)
// Filters out anything the logged-in user has no READ permission for
// (checked against default_permissions/user_special_permissions, already
// merged into req.user.permissions by authenticate() at login time).
// ============================

export const getModulesForSidebar = async (
  req: Request,
  res: Response,
) => {
  try {
    const modules = await fetchModulesWithSubModules()

    const permissions = req.user?.permissions ?? {}

    const visibleModules = modules
      .map((mod) => ({
        ...mod,
        subModules: mod.subModules.filter((sm) =>
          hasPermission(permissions[sm.code] ?? null, "READ"),
        ),
      }))
      .filter((mod) => mod.subModules.length > 0)

    return res.status(200).json({
      success: true,
      data: visibleModules,
    })
  } catch (error) {
    console.error(
      "GET MODULES FOR SIDEBAR ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
