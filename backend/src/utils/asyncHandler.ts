import type { NextFunction, Request, Response } from "express"

export const asyncHandler = (
  handler: (req: Request, res: Response) => Promise<unknown>,
) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next)
}
