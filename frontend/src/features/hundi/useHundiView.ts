import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { HundiViewDetail } from "./hundiViewTypes"

interface HundiViewState {
  id: number
  hundi: HundiViewDetail | null
  imageUrl: string | null
}

export function useHundiView(hundiId: number | null) {
  const [view, setView] = useState<HundiViewState | null>(null)

  useEffect(() => {
    if (!hundiId) return
    let active = true
    let objectUrl: string | null = null

    api
      .get(`/v1/hundi/${hundiId}`)
      .then((res) => {
        const data = (res.data?.data as HundiViewDetail | undefined) ?? null
        if (!active) return
        setView({ id: hundiId, hundi: data, imageUrl: null })
        if (!data?.hundi_image) return
        return api.get(`/v1/hundi/${hundiId}/image`, { responseType: "blob" }).then((imageRes) => {
          if (!active) return
          objectUrl = URL.createObjectURL(imageRes.data)
          setView({ id: hundiId, hundi: data, imageUrl: objectUrl })
        })
      })
      .catch(() => {
        if (!active) return
        setView((prev) => (prev?.id === hundiId ? prev : { id: hundiId, hundi: null, imageUrl: null }))
        showCmtToast("expiry", "Failed to load the hundi details. Please try again.")
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [hundiId])

  const current = view?.id === hundiId ? view : null
  const hundi = current?.hundi ?? null
  const totalCash = hundi?.denominations.reduce((sum, row) => sum + Number(row.total_amount), 0) ?? 0

  return {
    hundi,
    imageUrl: current?.imageUrl ?? null,
    isLoading: hundiId !== null && !current,
    totalCash,
  }
}
