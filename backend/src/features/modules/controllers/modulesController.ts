import { searchTerm } from "../../../utils/search"
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
import { isDuplicateEntryError, isDuplicateModuleNameError} from "../../../utils/dbError";
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
      searchTerm(req.query.search),
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
    const data = req.body as CreateModuleData;

    const moduleId = await createModule(data);

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: {
        id: moduleId,
      },
    });
  } catch (error: unknown) {
    if (isDuplicateModuleNameError(error)) {
      console.warn(
        `Duplicate module name attempted: ${req.body.module_name}`,
      );

      return res.status(409).json({
        success: false,
        message: "Module name already exists. Please enter a different name.",
        errors: {
          module_name: "This module name is already in use.",
        },
      });
    }

    if (isDuplicateEntryError(error)) {
      console.warn("Duplicate module code detected.");

      return res.status(409).json({
        success: false,
        message: "A duplicate module code already exists. Please try again.",
      });
    }

    console.error("CREATE MODULE FAILED:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the module. Please try again later.",
    });
  }
};
// ============================
// Update Module
// ============================


export const putModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const data = req.body as UpdateModuleData;

    const existingModule = await fetchModuleById(id);

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const updated = await editModule(id, data);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
    });
  } catch (error: unknown) {
    console.error("UPDATE MODULE ERROR:", error);

    if (isDuplicateEntryError(error)) {
      return res.status(409).json({
        success: false,
        message: `Module "${req.body.module_name ?? ""}" already exists. Please use a different module name.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update module. Please try again later.",
    });
  }
};
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

export const getModulesForSidebar = async (
  req: Request,
  res: Response,
) => {
  try {
    const modules = await fetchModulesWithSubModules()

    const permissions = req.user?.permissions ?? {}
    const expired = req.user?.expired ?? []

    const visibleModules = modules
      .map((mod) => ({
        ...mod,
        subModules: mod.subModules
          .filter((sm) => hasPermission(permissions[sm.code] ?? null, "READ") || expired.includes(sm.code))
          .map((sm) => ({ ...sm, expired: expired.includes(sm.code) })),
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
