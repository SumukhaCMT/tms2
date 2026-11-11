export interface ConfirmState {
  title: string
  description: string
  items?: string[]
  resolve: (confirmed: boolean) => void
}

let current: ConfirmState | null = null
const listeners = new Set<() => void>()

function setCurrent(next: ConfirmState | null) {
  current = next
  listeners.forEach((listener) => listener())
}

export function subscribeConfirm(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConfirmState() {
  return current
}

export function confirmDelete(description: string, title = "Delete record?", items?: string[]): Promise<boolean> {
  current?.resolve(false)
  return new Promise((resolve) => setCurrent({ title, description, items, resolve }))
}

export function closeConfirm(confirmed: boolean) {
  current?.resolve(confirmed)
  setCurrent(null)
}
