import app from "./app"
import { env } from "./config/env"
import { startUnblockNotifier } from "./jobs/unblockNotifier"

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(
        `TMS backend running on http://localhost:${env.port}`,
      )
      startUnblockNotifier()
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()