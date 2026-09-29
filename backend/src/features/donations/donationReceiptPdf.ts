import type { DonationDetail } from "./donationsTypes"

import { amountInWords } from "../../utils/pdf/amountInWords"
import {
  closingNote,
  formatCurrency,
  formatDate,
  formatNumber,
  keyValueGrid,
  noteBand,
  renderReceipt,
  sectionTitle,
  signatures,
  table,
  totalsBox,
} from "../../utils/pdf/receiptLayout"

export interface ReceiptContext {
  donation: DonationDetail
  templeName: string
}

function maskAadhaar(value: string | null): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "")
  return digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : ""
}

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function generateDonationReceiptPdf(ctx: ReceiptContext): Promise<Buffer> {
  const { donation, templeName } = ctx
  const monetary = donation.donation_monetary
  const inkind = donation.donation_inkind ?? []
  const amount = monetary ? Number(monetary.donation_monetary_amount) : 0
  const donationType = [monetary ? "Monetary" : "", inkind.length ? "In-Kind" : ""].filter(Boolean).join(" & ") || "-"
  const donorAddress = [
    donation.donor_address_line1,
    donation.donor_address_line2,
    donation.donor_city,
    donation.donor_state,
    donation.donor_pincode,
  ]
    .filter((part) => part && String(part).trim())
    .join(", ")

  return renderReceipt(
    {
      organizationName: templeName || "Temple",
      title: "Donation Receipt",
      meta: [
        { label: "Receipt No", value: donation.donation_number },
        { label: "Date", value: formatDate(donation.created_at) },
        { label: "Donation Type", value: donationType },
        ...(monetary ? [{ label: "Amount", value: formatCurrency(amount) }] : []),
      ],
      footerNote: "This is a system-generated acknowledgement receipt.",
    },
    (doc) => {
      sectionTitle(doc, "Donor Details")
      keyValueGrid(doc, [
        { label: "Name", value: donation.donor_name },
        { label: "Phone", value: donation.donor_phone ?? "" },
        { label: "Email", value: donation.donor_email ?? "" },
        { label: "Address", value: donorAddress },
      ])

      if (monetary) {
        sectionTitle(doc, "Monetary Donation")
        keyValueGrid(doc, [
          { label: "Payment Method", value: titleCase(monetary.donation_method) },
          { label: "Bank", value: monetary.donation_monetary_bank_name ?? "" },
          { label: "Reference No", value: monetary.donation_monetary_reference_number ?? "" },
          { label: "Reference Date", value: monetary.donation_monetary_reference_date ? formatDate(monetary.donation_monetary_reference_date) : "" },
          { label: "PAN", value: monetary.donor_pan_number ?? "" },
          { label: "Aadhaar", value: maskAadhaar(monetary.donor_aadhaar_number) },
        ])
        totalsBox(doc, [{ label: "Amount Received", value: formatCurrency(amount), emphasis: true }])
        noteBand(doc, "In Words", amountInWords(amount))
        keyValueGrid(doc, [{ label: "Remarks", value: monetary.donation_monetary_remarks ?? "" }], 1)
      }

      if (inkind.length) {
        sectionTitle(doc, "In-Kind Donation")
        table(
          doc,
          [
            { label: "#", width: 24 },
            { label: "Item", width: 136 },
            { label: "Type", width: 70 },
            { label: "Measurement", width: 85 },
            { label: "Qty", width: 35, align: "right" },
            { label: "Market Value", width: 85, align: "right" },
            { label: "Est. Value", width: 80, align: "right" },
          ],
          inkind.map((item, index) => [
            String(index + 1),
            item.remarks ? `${item.item_title}\n${item.remarks}` : item.item_title,
            titleCase(String(item.item_type)),
            item.measurement ? `${formatNumber(Number(item.measurement))} ${item.measurement_unit ?? ""}`.trim() : "-",
            formatNumber(Number(item.quantity)),
            Number(item.approximate_Market_value) > 0 ? formatCurrency(Number(item.approximate_Market_value)) : "-",
            Number(item.estimated_value) > 0 ? formatCurrency(Number(item.estimated_value)) : "-",
          ]),
        )
      }

      if (donation.stored_at || donation.overall_remarks) {
        sectionTitle(doc, "Additional Information")
        keyValueGrid(doc, [
          { label: "Stored At", value: donation.stored_at ?? "" },
          { label: "Remarks", value: donation.overall_remarks ?? "" },
        ])
      }

      signatures(doc, [{ title: "Authorized Signatory" }])

      closingNote(doc, "We gratefully acknowledge your generous contribution. May the blessings of the deity be with you and your family.")
    },
  )
}
