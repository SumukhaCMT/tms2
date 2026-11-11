
import type { Response } from "express";

export type TokenDuplicateField = "token_name" | "token_code";

export class TokenDuplicateError extends Error {
  public readonly field: TokenDuplicateField;

  constructor(field: TokenDuplicateField) {
    super(
      field === "token_name"
        ? "A token with this name already exists in this temple."
        : "This token code is already in use.",
    );

    this.name = "TokenDuplicateError";
    this.field = field;
  }
}

export function handleTokenError(error: unknown, res: Response) {
  if (error instanceof TokenDuplicateError) {
    return res.status(409).json({
      success: false,
      message: error.message,
      field: error.field,
    });
  }

  if (error instanceof Error && error.message === "Temple not found") {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.message === "Token not found") {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  const dbError = error as {
    code?: string;
    errno?: number;
    sqlMessage?: string;
    message?: string;
  };

  if (dbError?.code === "ER_DUP_ENTRY") {
    const duplicateText = [
      dbError.message,
      dbError.sqlMessage,
    ]
      .filter(Boolean)
      .join(" ");

    if (/token_name/i.test(duplicateText)) {
      return res.status(409).json({
        success: false,
        message: "A token with this name already exists.",
        field: "token_name",
      });
    }

    if (/token_code/i.test(duplicateText)) {
      return res.status(409).json({
        success: false,
        message: "This token code is already in use.",
        field: "token_code",
      });
    }

    return res.status(409).json({
      success: false,
      message: "A duplicate token record already exists.",
    });
  }

  if (dbError?.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "The selected Seva or deity does not exist.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
}
