
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import pool from "./config/database"
import cors from "cors"
import routes from "./routes"
import { errorMiddleware } from "./middleware/errorMiddleware"
import { notFoundMiddleware } from "./middleware/notFoundMiddleware"
const app = express()

// ============================
// Security
// ============================

app.use(helmet())

app.use(
  cors({
    // origin: "http://localhost:5173",
     origin: [
      "http://localhost:5173",
      "https://tms-frontend-wine.vercel.app",
    ],
    
    credentials: true,
  }),
)
// ============================
// Body Parser
// MUST come before routes
// ============================

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// ============================
// Logger
// ============================

app.use(morgan("dev"))

// ============================
// Health Check
// ============================

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TMS backend is running",
  })
})

// ============================
// Database Connectivity
// ============================

app.get("/databaseconnectivity", async (_req, res) => {
  let connection

  try {
    connection = await pool.getConnection()

    await connection.ping()

    return res.status(200).json({
      success: true,
      message: "TMS database connectivity is working",
    })
  } catch (error) {
    console.error(
      "Database connectivity error:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "TMS database connectivity failed",
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

app.use("/api", routes)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
export default app