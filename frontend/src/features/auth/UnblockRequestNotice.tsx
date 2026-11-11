import { useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

import api from "@/axios/axios"
import { Button } from "@/components/ui/button"

interface UnblockRequestNoticeProps {
  message: string
  login?: string
  token?: string
}

export function UnblockRequestNotice({ message, login, token }: UnblockRequestNoticeProps) {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function sendRequest() {
    setSending(true)
    const res = await api.post("/auth/unblock-request", { login, token }).catch((err) => err.response)
    setSending(false)
    setResult({
      ok: res?.status === 200,
      message: res?.data?.message || "Could not send your request. Please try again.",
    })
  }

  return (
    <div className="space-y-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </div>
      {result?.ok ? (
        <p className="text-sm font-medium text-green-600">{result.message}</p>
      ) : (
        <>
          {result && <p className="text-sm font-medium text-red-500">{result.message}</p>}
          <Button type="button" variant="outline" className="w-full" disabled={sending} onClick={sendRequest}>
            {sending && <Loader2 className="animate-spin" />}
            Send Request
          </Button>
        </>
      )}
    </div>
  )
}
