
export interface MySqlError extends Error {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  sql?: string;
}

const getMySqlError = (
  error: unknown,
): MySqlError | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  return error as MySqlError;
};

export const isDuplicateEntryError = (
  error: unknown,
): error is MySqlError => {
  const dbError = getMySqlError(error);

  return (
    dbError !== null &&
    (dbError.code === "ER_DUP_ENTRY" ||
      dbError.errno === 1062)
  );
};

export const isDuplicateModuleNameError = (
  error: unknown,
): error is MySqlError => {
  if (!isDuplicateEntryError(error)) {
    return false;
  }

  const dbError = getMySqlError(error);

  if (!dbError) {
    return false;
  }

  const message = [
    dbError.message,
    dbError.sqlMessage,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    /for key\s+['"`]?[^'"`]*module_name['"`]?/i.test(
      message,
    ) ||
    /for key\s+['"`]?[^'"`]*module_name[^'""`]*['"`]?/i.test(
      message,
    )
  );
};
