import type { Request, Response } from "express"
import type { RowDataPacket } from "mysql2/promise"

import { createManualOrder, getManualOrder, getManualOrderOptions, getManualOrders, updateManualOrder } from "../services/manualOrderService"
import { acceptOrder, getOrderDetails, getPendingOrders, rejectOrder } from "../services/orderRequestService"
import { manualOrderSchema } from "../validations/manualOrderValidation"
import { generateOrderAcknowledgementPdf } from "../pdf/orderAcknowledgementPdf"
import { searchTerm } from "../../../utils/search"

export const getPendingOrdersController = async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getPendingOrders() })
}

export const acceptOrderController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await acceptOrder(Number(req.params.id)) })
}

export const getOrderDetailsController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getOrderDetails(Number(req.params.id)) })
}

export const rejectOrderController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await rejectOrder(Number(req.params.id)) })
}

export const getManualOrderOptionsController = async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getManualOrderOptions() })
}

export const createManualOrderController = async (req: Request, res: Response) => {
  const validation = manualOrderSchema.safeParse(req.body)
  if (!validation.success) {
    res.status(400).json({ success: false, message: validation.error.issues[0]?.message ?? "Validation failed", errors: validation.error.flatten() })
    return
  }
  res.status(201).json({ success: true, message: "Order created successfully", data: await createManualOrder(validation.data) })
}

export const getManualOrdersController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getManualOrders(searchTerm(req.query.search)) })
}

export const getManualOrderController = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getManualOrder(Number(req.params.id)) })
}

export const updateManualOrderController = async (req: Request, res: Response) => {
  const validation = manualOrderSchema.safeParse(req.body)
  if (!validation.success) {
    res.status(400).json({ success: false, message: validation.error.issues[0]?.message ?? "Validation failed", errors: validation.error.flatten() })
    return
  }
  res.status(200).json({ success: true, message: "Order updated successfully", data: await updateManualOrder(Number(req.params.id), validation.data) })
}

export const getOrderAcknowledgementController = async (req: Request, res: Response) => {
  const order = (await getOrderDetails(Number(req.params.id))) as RowDataPacket
  const pdf = await generateOrderAcknowledgementPdf(order)
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename="${order.order_number}-acknowledgement.pdf"`)
  res.send(pdf)
}
