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
  queueLimit: 100,
  maxIdle: 2,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 15000,
  timezone: "Z",
})


pool.pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'")
  connection.query("SET SESSION max_execution_time = 5000", () => {})
  connection.query("SET SESSION max_statement_time = 5", () => {})
})

export default pool

// import mysql from "mysql2/promise";
// import { env } from "./env";

// const pool = mysql.createPool({
// host: env.dbHost,
// port: env.dbPort,
// user: env.dbUser,
// password: env.dbPassword,
// database: env.dbName,

// waitForConnections: true,
// connectionLimit: 10,
// queueLimit: 0,

// timezone: "Z",

// enableKeepAlive: true,
// keepAliveInitialDelay: 0,
// });

// pool.on("connection", (connection) => {
// connection.query("SET time_zone = '+00:00'", (error) => {
// if (error) {
// console.error(
// "Failed to set MySQL session timezone:",
// error.message,
// );
// }
// });
// });

// pool.on("error", (error) => {
// console.error("MySQL pool error:", error.message);
// });

// export default pool;
