
import type { Response } from "express";

export class SevaDuplicateError extends Error {
  constructor(
    public readonly field: "seva_name" | "seva_code",
  ) {
    super(
      field === "seva_name"
        ? "Seva name already exists for this temple."
        : "Seva code already exists.",
    );

    this.name = "SevaDuplicateError";
  }
}

export function handleSevaError(
  error: unknown,
  res: Response,
) {
  if (error instanceof SevaDuplicateError) {
    return res.status(409).json({
      success: false,
      message: error.message,
      field: error.field,
    });
  }

  if (error instanceof Error) {
    if (
      error.message === "Organization ID not found" ||
      error.message === "Invalid organization ID"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Invalid seva ID" ||
      error.message === "Invalid temple ID"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Temple not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred while processing Seva.",
  });
}
