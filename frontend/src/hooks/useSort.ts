import { useState } from "react"

export type SortDirection = "asc" | "desc"

export interface SortState {
  key: string
  direction: SortDirection
}

export function toTime(value: string | null | undefined) {
  const time = value ? Date.parse(value) : NaN
  return Number.isNaN(time) ? 0 : time
}

export function useSort<T>(rows: T[], accessors: Record<string, (row: T) => number>) {
  const [sort, setSort] = useState<SortState | null>(null)
  const accessor = sort ? accessors[sort.key] : undefined

  const sorted = accessor && sort
    ? [...rows].sort((a, b) => (accessor(a) - accessor(b)) * (sort.direction === "asc" ? 1 : -1))
    : rows

  return { sorted, sort, setSort }
}
