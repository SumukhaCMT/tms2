import { useState } from "react"

export function useRowSelection(pageIds: number[]) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length
  const allChecked = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someChecked = selectedOnPage > 0 && !allChecked

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => (allChecked ? next.delete(id) : next.add(id)))
      return next
    })
  }

  return {
    selectedIds: [...selected],
    isSelected: (id: number) => selected.has(id),
    allChecked,
    someChecked,
    toggle,
    toggleAll,
    clear: () => setSelected(new Set()),
  }
}
