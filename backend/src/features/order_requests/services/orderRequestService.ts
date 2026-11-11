import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { orderRequestRepository } from "../repositories/orderRequestRepository"

export const getPendingOrders = () => orderRequestRepository.listPending()

export const getOrderDetails = async (id: number) => {
  const order = await orderRequestRepository.findOrder(id)
  if (!order) throw new HttpError(404, "Order not found")
  return order
}

export const rejectOrder = (id: number) =>
  withTransaction(async (conn) => {
    const order = await orderRequestRepository.lockPlacedOrder(conn, id)
    if (!order) throw new HttpError(404, "Order not found or already processed")
    await orderRequestRepository.rejectOrder(conn, id)
    return { id }
  })

export const acceptOrder = (id: number) =>
  withTransaction(async (conn) => {
    const order = await orderRequestRepository.lockPlacedOrder(conn, id)
    if (!order) throw new HttpError(404, "Order not found or already processed")

    const items = await orderRequestRepository.listUnlinkedItems(conn, id)

    for (const item of items) {
      const subscriptionId = await orderRequestRepository.createSubscription(conn, order.organization_id, item)
      await orderRequestRepository.linkItem(conn, item.id, subscriptionId)
    }

    await orderRequestRepository.confirmOrder(conn, id)

    return { id, scheduled: items.length }
  })
