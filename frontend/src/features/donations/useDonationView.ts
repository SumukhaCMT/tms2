import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { DonationViewDetail } from "./donationViewTypes"

interface DonationViewState {
  id: number
  donation: DonationViewDetail | null
}

export function useDonationView(donationId: number | null) {
  const [view, setView] = useState<DonationViewState | null>(null)

  useEffect(() => {
    if (!donationId) return
    let active = true

    api
      .get(`/v1/donations/${donationId}`)
      .then((res) => {
        if (active) setView({ id: donationId, donation: (res.data?.data as DonationViewDetail | undefined) ?? null })
      })
      .catch(() => {
        if (!active) return
        setView({ id: donationId, donation: null })
        showCmtToast("expiry", "Failed to load the donation details. Please try again.")
      })

    return () => {
      active = false
    }
  }, [donationId])

  const current = view?.id === donationId ? view : null
  const donation = current?.donation ?? null
  const inkindTotal = donation?.donation_inkind.reduce((sum, row) => sum + Number(row.estimated_value || 0), 0) ?? 0

  return {
    donation,
    isLoading: donationId !== null && !current,
    inkindTotal,
  }
}
