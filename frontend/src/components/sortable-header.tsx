import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SortState } from "@/hooks/useSort"

interface SortableHeaderProps {
  label: string
  column: string
  sort: SortState | null
  onSort: (sort: SortState | null) => void
}

export function SortableHeader({ label, column, sort, onSort }: SortableHeaderProps) {
  const direction = sort?.key === column ? sort.direction : null
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 font-medium"
      aria-label={`Sort by ${label} ${direction === "asc" ? "descending" : "ascending"}`}
      onClick={() => onSort({ key: column, direction: direction === "asc" ? "desc" : "asc" })}
    >
      <span className="whitespace-normal">{label}</span>
      <Icon className={direction ? "size-3.5" : "size-3.5 text-muted-foreground"} />
    </Button>
  )
}
