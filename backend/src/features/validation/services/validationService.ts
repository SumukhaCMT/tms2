import { HttpError } from "../../../utils/httpError"
import { formatError } from "../../../utils/validators"
import { valueExists } from "../repositories/validationRepository"
import { uniqueRules } from "../validationRules"

export interface UniqueCheckInput {
  entity: string
  field: string
  value: string
  excludeId?: number
  organizationId?: number
}

export const findUniqueField = (entity: string, field: string) => uniqueRules[entity]?.[field]

export const validateUnique = async ({ entity, field, value, excludeId, organizationId }: UniqueCheckInput) => {
  const rule = findUniqueField(entity, field)
  const trimmed = value.trim()

  if (!rule || !trimmed) return { valid: true, message: "" }

  const invalidFormat = formatError(rule.rule, trimmed)
  if (invalidFormat) return { valid: false, message: invalidFormat }

  const targets = rule.targets.filter((target) => !(excludeId && target.createOnly))
  const results = await Promise.all(targets.map((target) => valueExists(target, trimmed, excludeId, organizationId)))

  return results.some(Boolean)
    ? { valid: false, message: `This ${rule.label} is already registered` }
    : { valid: true, message: "" }
}

export const assertUnique = async (input: UniqueCheckInput) => {
  const result = await validateUnique(input)
  if (!result.valid) throw new HttpError(409, result.message)
}
