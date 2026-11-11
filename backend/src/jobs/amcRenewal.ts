import { amcRepository } from "../features/amc/amcRepository"

const INTERVAL_MS = 60 * 60 * 1000

export const startAmcRenewal = () => {
  const run = () => amcRepository.createDueRenewals().catch((error) => console.error("AMC renewal failed:", error))
  run()
  setInterval(run, INTERVAL_MS)
}
