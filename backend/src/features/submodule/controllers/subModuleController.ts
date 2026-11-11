import { searchTerm } from "../../../utils/search"
import type { Request, Response } from "express";
import * as subModuleService from "../services/subModuleService";

interface DatabaseError extends Error {
  code?: string;
  sqlMessage?: string;
}

const isDuplicateSubModuleNameError = (
  error: unknown,
): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const dbError = error as DatabaseError;

  if (dbError.code !== "ER_DUP_ENTRY") {
    return false;
  }

  const message = [
    dbError.message,
    dbError.sqlMessage,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return message.includes("sub_module_name");
};

const handleControllerError = (
  error: unknown,
  res: Response,
  action: "create" | "update",
): void => {
  console.error(`Submodule ${action} failed:`, error);

  if (isDuplicateSubModuleNameError(error)) {
    res.status(409).json({
      success: false,
      message: "This submodule name already exists. Please enter a different name.",
      errors: {
        sub_module_name:
          "This submodule name already exists. Please choose another name.",
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    message:
      action === "create"
        ? "Failed to create submodule. Please try again."
        : "Failed to update submodule. Please try again.",
  });
};

export const createSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await subModuleService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Submodule created successfully.",
      data: result,
    });
  } catch (error: unknown) {
    handleControllerError(error, res, "create");
  }
};

export const getSubModules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const moduleIdParam = req.query.module_id;

    const moduleId =
      typeof moduleIdParam === "string"
        ? Number(moduleIdParam)
        : undefined;

    const result = await subModuleService.getAll(moduleId, searchTerm(req.query.search));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Fetching submodules failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submodules.",
    });
  }
};

export const getSubModuleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await subModuleService.getById(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Fetching submodule failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submodule.",
    });
  }
};

export const updateSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const result = await subModuleService.update(
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Submodule updated successfully.",
      data: result,
    });
  } catch (error: unknown) {
    handleControllerError(error, res, "update");
  }
};

export const deleteSubModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    await subModuleService.remove(id);

    res.status(200).json({
      success: true,
      message: "Submodule deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Deleting submodule failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete submodule.",
    });
  }
};
