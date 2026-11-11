import api from "@/axios/axios"
import { confirmDelete } from "@/components/confirm-delete"
import { showCmtToast } from "@/components/ui/cmt-toast"

export async function bulkDelete(
  ids: number[],
  target: string | ((id: number) => Promise<unknown>),
  label: string,
  names: string[] = [],
): Promise<number[]> {
  const confirmed = await confirmDelete(`The following ${label} will be permanently deleted. This cannot be undone.`, `Delete ${ids.length} ${label}?`, names)
  if (!confirmed) return []

  const run = typeof target === "string" ? (id: number) => api.delete(`${target}/${id}`) : target
  const results = await Promise.allSettled(ids.map(run))
  const deleted = ids.filter((_, index) => results[index].status === "fulfilled")
  const failed = ids.length - deleted.length

  if (deleted.length) showCmtToast("success", `${deleted.length} ${label} deleted successfully.`)
  if (failed) showCmtToast("expiry", `${failed} ${label} could not be deleted. Please try again.`)
  return deleted
}
