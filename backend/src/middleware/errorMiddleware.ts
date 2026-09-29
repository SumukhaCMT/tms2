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

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(error)

  const message =
    error instanceof Error
      ? error.message
      : "Internal server error"

  res.status(500).json({
    success: false,
    message,
  })
}