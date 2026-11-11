import api from "@/axios/axios"

import type { MeasurementUnitOption } from "./inventoryFormTypes"

let cache: Promise<MeasurementUnitOption[]> | null = null

export const getMeasurementUnits = () => {
  cache ??= api
    .get("/v1/inventory/measurements/units")
    .then((res) => (Array.isArray(res?.data?.data) ? res.data.data : []))
    .catch(() => {
      cache = null
      return []
    })
  return cache
}

export const clearMeasurementUnits = () => {
  cache = null
}
