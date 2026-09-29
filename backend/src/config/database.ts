import mysql from "mysql2/promise"
import { env } from "./env"

const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Treat every DATETIME/TIMESTAMP value coming back from MySQL as UTC when
  // building JS Date objects (instead of assuming the app server's local tz).
  timezone: "Z",
})

// The remote host's MySQL session timezone can't be trusted to match the app
// server's local timezone. Without forcing this, NOW()/DATE_ADD() on the DB
// side and Date.now()/new Date() on the Node side can silently disagree by
// several hours — which is what was making freshly-issued reset tokens (and
// lockout/blocked_until windows) look already expired the instant they were
// created. Force every pooled connection's session into UTC so both sides
// always agree.
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'")
})

export default pool