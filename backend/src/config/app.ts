// import express from "express"

// import helmet from "helmet"
// // import cors from "cors"
// import morgan from "morgan"

// import routes from "../routes"
// import { errorMiddleware } from "../middleware/errorMiddleware"
// import { notFoundMiddleware } from "../middleware/notFoundMiddleware"

// const app = express()

// app.use(helmet())
// // app.use(cors())

// app.use(express.json({ limit: "10mb" }))
// app.use(express.urlencoded({ extended: true }))

// app.use(morgan("dev"))

// app.get("/health", (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "TMS backend is running",
//   })
// })

// app.use("/api/v1", routes)

// app.use(notFoundMiddleware)
// app.use(errorMiddleware)

// export default app