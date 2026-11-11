
import type { Response } from "express";

export class SevaBookingDuplicateError extends Error {
  constructor(
    public readonly field: "booking_receipt_number",
  ) {
    super("Seva booking receipt number already exists.");
    this.name = "SevaBookingDuplicateError";
  }
}

export function handleSevaBookingError(
  error: unknown,
  res: Response,
) {
  if (error instanceof SevaBookingDuplicateError) {
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
      error.message === "Invalid booking ID" ||
      error.message === "Invalid temple ID"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Authenticated user ID not found"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Temple not found" ||
      error.message === "Seva not found or inactive"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message:
      "An unexpected error occurred while processing Seva Booking.",
  });
}
