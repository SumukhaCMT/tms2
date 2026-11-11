
export const handleDeityError = (
  error: unknown
): { statusCode: number; message: string } => {
  const err = error as {
    code?: string;
    sqlMessage?: string;
    message?: string;
  };

  const sqlMessage = String(err?.sqlMessage ?? err?.message ?? "");

  if (err?.code === "ER_DUP_ENTRY") {
    if (
      sqlMessage.includes("uk_temple_deity_name") ||
      sqlMessage.includes("deity_name")
    ) {
      return {
        statusCode: 409,
        message: "A deity with this name already exists in this temple.",
      };
    }

    if (
      sqlMessage.includes("uk_temple_deity_code") ||
      sqlMessage.includes("deity_code")
    ) {
      return {
        statusCode: 409,
        message: "This deity code already exists in this temple.",
      };
    }

    if (
      sqlMessage.includes("uk_deity_img") ||
      sqlMessage.includes("deity_img_name")
    ) {
      return {
        statusCode: 409,
        message: "This deity image name is already in use.",
      };
    }

    return {
      statusCode: 409,
      message: "A duplicate deity record already exists.",
    };
  }

  if (
    err?.code === "ER_NO_REFERENCED_ROW_2" ||
    err?.code === "ER_NO_REFERENCED_ROW"
  ) {
    return {
      statusCode: 400,
      message: "The selected temple or organization does not exist.",
    };
  }

  if (
    err?.code === "ER_ROW_IS_REFERENCED_2" ||
    err?.code === "ER_ROW_IS_REFERENCED"
  ) {
    return {
      statusCode: 409,
      message: "This deity is being referenced by another record.",
    };
  }

  return {
    statusCode: 500,
    message: "Failed to process deity request.",
  };
};