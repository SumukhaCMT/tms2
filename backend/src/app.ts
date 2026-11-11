
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import pool from "./config/database"
import cors from "cors"
import { performance } from "node:perf_hooks";
import routes from "./routes"
import { errorMiddleware } from "./middleware/errorMiddleware"
import { notFoundMiddleware } from "./middleware/notFoundMiddleware"
import { activityLog } from "./middleware/activityLog.middleware"
import { apiRateLimit } from "./middleware/rateLimitMiddleware"
const app = express()

app.set("etag", false)
app.set("trust proxy", 1)

// ============================
// Security
// ============================

app.use(helmet())

app.use(
  cors({
   
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

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))

// ============================
// Logger
// ============================

app.use(morgan("dev"))

// ============================
// API Response-Time Monitoring
// Register before routes
// ============================

app.use((req, res, next) => {
  const startTime = performance.now();

  res.on("finish", () => {
    const responseTimeMs = Number(
      (performance.now() - startTime).toFixed(2),
    );

    // Avoid logging health-check traffic.
    if (
      req.path === "/health" ||
      req.path === "/databaseconnectivity"
    ) {
      return;
    }

    console.info(
      `[API Performance] ${req.method} ${req.originalUrl} | ` +
        `Status: ${res.statusCode} | ` +
        `Response: ${responseTimeMs}ms`,
    );
  });

  next();
});

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

app.use("/api", apiRateLimit, activityLog, routes)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
export default app