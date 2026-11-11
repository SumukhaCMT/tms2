import type { Request, Response } from "express"

import { activateCredits, addCartItem, checkout, discardCart, getActiveSubscriptions, getCart, getCredits, getExpiredPlans, getUpcomingPlans, removeCartItem } from "../services/cartService"

const currentUser = (req: Request) => req.user as Express.User

export const getCartController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getCart(currentUser(req)) })
}

export const addCartItemController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await addCartItem(currentUser(req), req.body) })
}

export const removeCartItemController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await removeCartItem(currentUser(req), Number(req.params.id)) })
}

export const checkoutController = async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await checkout(currentUser(req), req.body) })
}

export const getSubscriptionsController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getActiveSubscriptions(currentUser(req)) })
}

export const getUpcomingController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getUpcomingPlans(currentUser(req)) })
}

export const getExpiredController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getExpiredPlans(currentUser(req)) })
}

export const discardCartController = async (req: Request, res: Response) => {
  await discardCart(currentUser(req))
  res.status(200).json({ success: true, data: [] })
}

export const getCreditsController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getCredits(currentUser(req), String(req.params.type)) })
}

export const activateCreditsController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await activateCredits(currentUser(req), String(req.params.type)), message: "Plan activated" })
}
