import app from "./app"
import { env } from "./config/env"
import { startUnblockNotifier } from "./jobs/unblockNotifier"
import { startCartReminder } from "./jobs/cartReminder"
import { startAmcRenewal } from "./jobs/amcRenewal"

process.on("unhandledRejection", (error) => console.error("Unhandled rejection:", error))
process.on("uncaughtException", (error) => console.error("Uncaught exception:", error))

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(
        `TMS backend running on http://localhost:${env.port}`,
      )
      startUnblockNotifier()
      startCartReminder()
      startAmcRenewal()
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()