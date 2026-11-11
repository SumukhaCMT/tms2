import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function BulkActionBar({ count, onClear, onDelete }: { count: number; onClear: () => void; onDelete: () => void }) {
  if (!count) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 />
          Delete selected
        </Button>
      </div>
    </div>
  )
}
