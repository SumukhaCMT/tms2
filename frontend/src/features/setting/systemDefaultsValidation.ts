import type {
  CreateSystemDefaultPayload,
  UpdateSystemDefaultPayload,
} from "./systemDefaultsTypes"

export const validateSystemDefault = (
  data:
    | CreateSystemDefaultPayload
    | UpdateSystemDefaultPayload,
) => {
  if (
    "key_name" in data &&
    !data.key_name.trim()
  ) {
    return "Key name is required"
  }

  if (
    data.value_int === undefined ||
    data.value_int === null
  ) {
    return "Value is required"
  }

  if (
    Number.isNaN(
      Number(data.value_int),
    )
  ) {
    return "Value must be a number"
  }

  if (
    Number(data.value_int) < 0
  ) {
    return "Value cannot be negative"
  }

  return null
}