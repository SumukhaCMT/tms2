import type { IfscBankDetail } from "./hundiTypes"

export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/

export const fetchIfscDetail = async (code: string): Promise<IfscBankDetail | null> => {
  const response = await fetch(`https://ifsc.razorpay.com/${code}`)

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { IFSC: string; BANK: string; BRANCH: string }

  return { ifsc: data.IFSC, bank: data.BANK, branch: data.BRANCH }
}
