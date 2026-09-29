import type {
  CreateSystemDefaultPayload,
  UpdateSystemDefaultPayload,
} from "../systemDefaultsTypes"

export const validateCreateSystemDefault = (
  data: CreateSystemDefaultPayload,
) => {
  if (!data.key_name?.trim()) {
    throw new Error("Key name is required")
  }

  if (
    data.value_int === undefined ||
    data.value_int === null ||
    Number.isNaN(Number(data.value_int))
  ) {
    throw new Error("Integer value is required")
  }

  if (Number(data.value_int) < 0) {
    throw new Error(
      "Value cannot be negative",
    )
  }
}

export const validateUpdateSystemDefault = (
  data: UpdateSystemDefaultPayload,
) => {
  if (
    data.value_int === undefined ||
    data.value_int === null ||
    Number.isNaN(Number(data.value_int))
  ) {
    throw new Error("Integer value is required")
  }

  if (Number(data.value_int) < 0) {
    throw new Error(
      "Value cannot be negative",
    )
  }
}