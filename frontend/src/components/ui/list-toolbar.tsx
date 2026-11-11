import type { ReactNode } from "react"
import { LayoutGrid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb"
import { SearchBar } from "@/components/ui/search-bar"

export type ListView = "list" | "grid"

interface ListToolbarProps {
  title?: ReactNode
  actions?: ReactNode
  onSearch: (value: string) => void
  searchPlaceholder?: string
  view?: ListView
  onViewChange?: (view: ListView) => void
}

export function ListToolbar({ title, actions, onSearch, searchPlaceholder, view, onViewChange }: ListToolbarProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="min-w-0 space-y-1" data-list-header="">
          <h2 className="text-lg font-semibold">{title}</h2>
          <PageBreadcrumb />
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar onSearch={onSearch} placeholder={searchPlaceholder} />
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {actions}
          {view && onViewChange && (
            <div className="flex items-center gap-1 rounded-md border p-1">
              <Button
                type="button"
                size="icon"
                variant={view === "list" ? "default" : "ghost"}
                className="cursor-pointer"
                title="List View"
                onClick={() => onViewChange("list")}
              >
                <List className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={view === "grid" ? "default" : "ghost"}
                className="cursor-pointer"
                title="Grid View"
                onClick={() => onViewChange("grid")}
              >
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
