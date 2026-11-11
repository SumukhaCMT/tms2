// import type {  Request, Response ,NextFunction } from "express"

// export const errorMiddleware = (
//   error: unknown,
//   _req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   console.error(error)

//   const message =
//     error instanceof Error
//       ? error.message
//       : "Internal server error"

//   res.status(500).json({
//     success: false,
//     message,
//   })
// }

import type { NextFunction, Request, Response } from "express"
import multer from "multer"
import { HttpError } from "../utils/httpError"

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(error)

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: error.code === "LIMIT_FILE_SIZE" ? "Maximum file size is 5 MB." : error.message,
    })
    return
  }

  const message =
    error instanceof Error
      ? error.message
      : "Internal server error"

  res.status(error instanceof HttpError ? error.status : 500).json({
    success: false,
    message,
  })
}
