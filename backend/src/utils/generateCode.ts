
/// code ganarate if temple id not send only name pass
export const generateCode = (
  name: string,
  templeId: number | string,
  recordId: number | string,
): string => {
  const cleanName = name
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const id = Number(templeId);
  const record = Number(recordId);

  if (!cleanName) {
    throw new Error("A valid name is required.");
  }

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid temple ID is required.");
  }

  if (!Number.isSafeInteger(record) || record <= 0) {
    throw new Error("A valid record ID is required.");
  }

  return `${cleanName}-T${id}-${String(record).padStart(5, "0")}`;
};



/// code ganarate if temple id not send only name pass



export const generateCodes = (name: string): string => {
  const cleanName = name
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleanName) {
    throw new Error("A valid name is required.");
  }

  return cleanName;
};

