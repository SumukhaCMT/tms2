import { Eye, Pencil, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { actionHover } from "@/components/ui/action-styles"

const ACTIONS = {
  view: { icon: Eye, label: "View" },
  edit: { icon: Pencil, label: "Edit" },
  delete: { icon: Trash2, label: "Delete" },
}

interface RowActionProps {
  type: keyof typeof ACTIONS
  to?: string
  onClick?: () => void
  disabled?: boolean
  title?: string
}

export function RowAction({ type, to, onClick, disabled, title }: RowActionProps) {
  const { icon: Icon, label } = ACTIONS[type]

  return (
    <Button
      variant="ghost"
      size="icon"
      title={title ?? label}
      aria-label={title ?? label}
      className={actionHover[type]}
      disabled={disabled}
      onClick={onClick}
      render={to ? <Link to={to} /> : undefined}
    >
      <Icon />
    </Button>
  )
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>
}
