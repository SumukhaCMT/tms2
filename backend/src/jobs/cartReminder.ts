import fs from "fs"
import path from "path"
import mjml2html from "mjml"

import db from "../config/database"
import { cartRepository } from "../features/cart/repositories/cartRepository"
import { sendMail } from "../utils/mail"

const INTERVAL_MS = 30 * 1000
const TEMPLATE_PATH = path.join(__dirname, "../templates/cart-reminder.mjml")

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const sendReminder = async (cart: { id: number; user_name: string; user_email: string }) => {
  if (!(await cartRepository.markReminded(db, cart.id))) return
  const items = await cartRepository.listItems(db, cart.id)
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0)
  const rows = items
    .map(
      (item) => `
            <tr style="border-bottom: 1px solid #f0f0f0">
              <td style="padding: 12px 0">${escape(item.item_name)}</td>
              <td style="padding: 12px 0; text-align: right">${currency.format(Number(item.line_total))}</td>
            </tr>`,
    )
    .join("")
  const checkoutLink = `${process.env.CLIENT_URL}/plans`
  const { html } = await mjml2html(
    fs.readFileSync(TEMPLATE_PATH, "utf8")
      .replace(/{{name}}/g, escape(cart.user_name))
      .replace("{{items}}", rows)
      .replace("{{total}}", currency.format(total))
      .replace(/{{checkoutLink}}/g, checkoutLink)
      .replace(/{{discardLink}}/g, `${checkoutLink}?discard=1`),
  )
  await sendMail({
    to: cart.user_email,
    subject: "You have an unfinished purchase",
    html,
    text: `Hi ${cart.user_name}, you have ${items.length} item(s) in your cart. Complete your purchase: ${checkoutLink}`,
  })
}

const runCartReminder = async () => {
  const carts = await cartRepository.listCartsToRemind(db)
  for (const cart of carts) await sendReminder(cart)
}

export const startCartReminder = () => {
  const run = () => runCartReminder().catch((error) => console.error("Cart reminder failed:", error))
  run()
  setInterval(run, INTERVAL_MS)
}
