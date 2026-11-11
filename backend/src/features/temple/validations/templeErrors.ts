


import type { Response } from "express";

interface DatabaseError {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  message?: string;
  sqlState?: string;
  sql?: string;
}

export type TempleUniqueField =
  | "temp_name"
  | "temp_registration_number"
  | "temp_gst_number"
  | "temp_email"
  | "temp_phone"
  | "temp_slug";

const duplicateMessages: Record<TempleUniqueField, string> = {
  temp_name: "A temple with this name already exists.",
  temp_registration_number:
    "This temple registration number already exists.",
  temp_gst_number: "This GST number is already registered.",
  temp_email: "A temple with this email address already exists.",
  temp_phone: "A temple with this phone number already exists.",
  temp_slug: "This temple URL slug already exists.",
};

export class TempleDuplicateError extends Error {
  public readonly statusCode = 409;
  public readonly code = "TEMPLE_DUPLICATE";

  constructor(public readonly field: TempleUniqueField) {
    super(duplicateMessages[field]);
    this.name = "TempleDuplicateError";
  }
}

const duplicateIndexFields: Record<string, TempleUniqueField> = {
  uk_temple_name: "temp_name",
  uk_temple_registration_number: "temp_registration_number",
  uk_temple_gst_number: "temp_gst_number",
  uk_temple_email: "temp_email",
  uk_temple_phone: "temp_phone",
  uk_temple_slug: "temp_slug",

  // Common alternative index names:
  temp_name: "temp_name",
  temp_registration_number: "temp_registration_number",
  temp_gst_number: "temp_gst_number",
  temp_email: "temp_email",
  temp_phone: "temp_phone",
  temp_slug: "temp_slug",
};

function getDuplicateField(
  message: string,
): TempleUniqueField | null {
  const normalized = message.toLowerCase();

  for (const [indexName, field] of Object.entries(
    duplicateIndexFields,
  )) {
    if (normalized.includes(indexName.toLowerCase())) {
      return field;
    }
  }

  return null;
}

export const handleTempleError = (
  error: unknown,
  res: Response,
): Response => {
  if (error instanceof TempleDuplicateError) {
    return res.status(409).json({
      success: false,
      code: error.code,
      field: error.field,
      message: error.message,
    });
  }

  const dbError = (error ?? {}) as DatabaseError;
  const code = dbError.code;
  const errno = dbError.errno;

  const message = (
    dbError.sqlMessage ??
    dbError.message ??
    ""
  ).toLowerCase();

  if (code === "ER_DUP_ENTRY" || errno === 1062) {
    const field = getDuplicateField(message);

    if (field) {
      return res.status(409).json({
        success: false,
        code: "TEMPLE_DUPLICATE",
        field,
        message: duplicateMessages[field],
      });
    }

    return res.status(409).json({
      success: false,
      code: "DUPLICATE_ENTRY",
      message:
        "A record with the same unique information already exists.",
    });
  }

  if (
    code === "ER_NO_REFERENCED_ROW_2" ||
    errno === 1452
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization or related record.",
    });
  }

  if (
    code === "ER_ROW_IS_REFERENCED_2" ||
    errno === 1451
  ) {
    return res.status(409).json({
      success: false,
      message:
        "Temple cannot be deleted because related records exist.",
    });
  }

  if (
    code === "ER_DATA_TOO_LONG" ||
    errno === 1406
  ) {
    return res.status(400).json({
      success: false,
      message: "One or more fields contain too much data.",
    });
  }

  if (
    code === "ER_TRUNCATED_WRONG_VALUE" ||
    errno === 1292
  ) {
    return res.status(400).json({
      success: false,
      message: "One or more fields contain an invalid value.",
    });
  }

  if (
    code === "ER_BAD_NULL_ERROR" ||
    errno === 1048
  ) {
    return res.status(400).json({
      success: false,
      message: "A required field cannot be empty.",
    });
  }

  if (
    code === "ER_BAD_FIELD_ERROR" ||
    errno === 1054
  ) {
    return res.status(500).json({
      success: false,
      message: "Database configuration error.",
    });
  }

  if (
    code === "ER_PARSE_ERROR" ||
    errno === 1064
  ) {
    return res.status(500).json({
      success: false,
      message: "Database query error.",
    });
  }

  if (error instanceof Error) {
    const statusByMessage: Record<string, number> = {
      "Organization ID not found": 401,
      "Invalid organization ID": 400,
      "Invalid temple ID": 400,
      "Organization not found": 404,
      "Temple not found": 404,
      "Invalid organization temple limit": 500,
    };

    if (error.message.startsWith("Temple limit reached.")) {
      return res.status(409).json({
        success: false,
        code: "TEMPLE_LIMIT_REACHED",
        message: error.message,
      });
    }

    const status = statusByMessage[error.message];

    if (status !== undefined) {
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
