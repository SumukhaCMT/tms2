import { useCallback, useEffect, useState } from "react"
import { Headset } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { StatusTag } from "@/components/ui/status-select"
import { getContacts, updateContactStatus, type ContactEnquiry } from "@/features/contact/contactService"
import { apiErrorMessage } from "@/features/subscription/services/cartService"

export default function PendingEnquiries() {
  const [rows, setRows] = useState<ContactEnquiry[]>([])
  const [total, setTotal] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(() => {
    Promise.all([getContacts(1, 5), getContacts(1, 1, "pending")])
      .then(([latest, pending]) => {
        setRows(latest.data)
        setTotal(pending.pagination.total)
      })
      .catch(() => setRows([]))
  }, [])

  useEffect(load, [load])

  const resolve = (id: number) => {
    setBusyId(id)
    updateContactStatus(id, "resolved")
      .then((res) => {
        showCmtToast("success", res.message)
        load()
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error)))
      .finally(() => setBusyId(null))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headset className="size-4" />
          Technical Difficulties
          {total > 0 && <Badge variant="destructive">{total} pending</Badge>}
        </CardTitle>
        <CardDescription>Latest enquiries raised by users</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" render={<Link to="/contact" />}>
            View All
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No enquiries yet</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold">
                  #{row.id} · {row.subject}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{row.message}</p>
                <p className="text-xs text-muted-foreground">
                  {row.user_name} · {row.org_name ?? "-"}
                  {row.temp_name ? ` / ${row.temp_name}` : ""} · {row.module_name ?? "-"} ·{" "}
                  {new Date(row.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              {row.resolved_at ? (
                <StatusTag status="resolved" />
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <StatusTag status="pending" />
                  <Button size="sm" disabled={busyId === row.id} onClick={() => resolve(row.id)}>
                    {busyId === row.id ? "Saving..." : "Mark Resolved"}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
