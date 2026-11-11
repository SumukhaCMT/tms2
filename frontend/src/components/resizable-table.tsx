import { Fragment, useState } from "react"
import type { ReactNode } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Table } from "@/components/ui/table"
import { cn } from "cn"

export interface ResizableColumn {
  id: string
  label: ReactNode
  size: number
  minSize?: number
  className?: string
}

export function ResizableTable({ columns, children }: { columns: ResizableColumn[]; children: ReactNode }) {
  const total = columns.reduce((sum, column) => sum + column.size, 0)
  const defaults = Object.fromEntries(columns.map((column) => [column.id, (column.size / total) * 100]))
  const [layout, setLayout] = useState<Record<string, number>>({})
  const width = (id: string) => `${layout[id] ?? defaults[id]}%`

  return (
    <div className="group/table relative overflow-hidden rounded-md border">
      <div className="flex min-h-10 border-b">
        {columns.map((column) => (
          <div
            key={column.id}
            style={{ width: width(column.id) }}
            className={cn("flex min-w-0 shrink-0 items-center px-2 py-2 text-sm leading-tight font-medium break-words whitespace-normal text-foreground", column.className)}
          >
            {column.label}
          </div>
        ))}
      </div>
      <Table className="table-fixed [&_td]:break-words [&_td]:whitespace-normal">
        <colgroup>
          {columns.map((column) => (
            <col key={column.id} style={{ width: width(column.id) }} />
          ))}
        </colgroup>
        {children}
      </Table>
      <ResizablePanelGroup
        key={columns.map((column) => column.id).join()}
        orientation="horizontal"
        onLayoutChange={setLayout}
        className="pointer-events-none absolute! inset-0 h-auto!"
      >
        {columns.map((column, index) => (
          <Fragment key={column.id}>
            {index > 0 && (
              <ResizableHandle className="pointer-events-auto w-0 bg-transparent opacity-0 transition-opacity group-hover/table:opacity-100 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border after:w-2 data-[separator=active]:opacity-100 data-[separator=active]:before:bg-primary data-[separator=hover]:opacity-100 data-[separator=hover]:before:bg-primary" />
            )}
            <ResizablePanel id={column.id} defaultSize={String(defaults[column.id])} minSize={String(column.minSize ?? 4)} />
          </Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  )
}
