export const handlePaymentMethodError = (
  error: unknown
): {
  statusCode: number;
  message: string;
} => {
  const err = error as {
    code?: string;
    sqlMessage?: string;
    message?: string;
  };

  if (err?.code === "ER_DUP_ENTRY") {
    const sqlMessage = String(err.sqlMessage ?? "");

    if (
      sqlMessage.includes("uk_payment_method_temple") ||
      (
        sqlMessage.includes("temple_id") &&
        sqlMessage.includes("payment_method")
      )
    ) {
      return {
        statusCode: 409,
        message:
          "This payment method already exists for this temple.",
      };
    }

    return {
      statusCode: 409,
      message: "Payment method already exists.",
    };
  }

  if (err?.code === "ER_NO_REFERENCED_ROW_2") {
    return {
      statusCode: 400,
      message: "Invalid temple or organization.",
    };
  }

  if (err?.code === "ER_ROW_IS_REFERENCED_2") {
    return {
      statusCode: 409,
      message:
        "Payment method cannot be deleted because it is being used elsewhere.",
    };
  }

  return {
    statusCode: 500,
    message:
      err?.message || "Failed to process payment method request.",
  };
};