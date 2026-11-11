import { Link, useParams } from "react-router-dom"
import { CalendarDays, Gift, IndianRupee, Package, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useModulePermissions } from "@/hooks/useModulePermissions"
import { TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailPage, DetailSection, DetailStats, DetailText } from "@/components/ui/detail-page"

import { useDonationView } from "./useDonationView"

function formatDate(value: string | null, withTime = false) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  })
}

function formatAmount(value: number | null) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function titleCase(value: string | null) {
  if (!value) return "-"
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function maskId(value: string | null) {
  if (!value) return "-"
  return value.length > 4 ? `${"•".repeat(value.length - 4)}${value.slice(-4)}` : value
}

export default function DonationViewPage() {
  const { id } = useParams<{ id: string }>()
  const { canEdit } = useModulePermissions("donations")
  const donationId = Number(id)
  const { donation, isLoading, inkindTotal } = useDonationView(Number.isFinite(donationId) ? donationId : null)

  const monetary = donation?.donation_monetary ?? null
  const inkind = donation?.donation_inkind ?? []
  const donorAddress = [donation?.donor_address_line1, donation?.donor_address_line2, donation?.donor_city, donation?.donor_state, donation?.donor_pincode]
    .filter(Boolean)
    .join(", ")

  return (
    <DetailPage
      title={donation?.donation_number ?? "Donation Details"}
      description={donation ? `${donation.temp_name} · ${donation.donor_name}` : "Donation record details"}
      badges={
        <>
          {monetary && <Badge>Monetary</Badge>}
          {inkind.length > 0 && <Badge variant="secondary">In-Kind</Badge>}
        </>
      }
      actions={
        donation &&
        canEdit && (
          <Button render={<Link to={`/donations/edit/${donation.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={isLoading}
      empty={!donation && "Donation details are not available."}
    >
      {donation && (
        <>
          <DetailStats
            items={[
              { label: "Monetary Amount", value: formatAmount(monetary?.donation_monetary_amount ?? null), icon: IndianRupee, hint: titleCase(monetary?.donation_method ?? null), hidden: !monetary },
              { label: "In-Kind Value", value: formatAmount(inkindTotal), icon: Gift, hidden: inkind.length === 0 },
              { label: "In-Kind Items", value: inkind.length, icon: Package, hidden: inkind.length === 0 },
              { label: "Recorded On", value: formatDate(donation.created_at), icon: CalendarDays },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Receiver"
                  description="Received on behalf of the temple"
                  fields={[
                    { label: "Receiver Name", value: donation.receiver_name },
                    { label: "Designation", value: donation.receiver_designation },
                    { label: "Phone", value: donation.receiver_phone },
                  ]}
                />
                <DetailSection title="Remarks">
                  <DetailText fallback="No remarks added.">{donation.overall_remarks}</DetailText>
                </DetailSection>
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created By", value: donation.created_by_name, hidden: !donation.created_by_name, full: true },
                    { label: "Created At", value: formatDate(donation.created_at, true) },
                    { label: "Last Updated", value: formatDate(donation.updated_at, true) },
                  ]}
                />
              </>
            }
          >
            <DetailSection
              title="Donor Details"
              description="Contact information of the donor"
              fields={[
                { label: "Donor Name", value: donation.donor_name },
                { label: "Phone", value: donation.donor_phone },
                { label: "Email", value: donation.donor_email },
                { label: "Temple", value: donation.temp_name },
                { label: "Address", value: donorAddress, full: true },
              ]}
            />

            {monetary && (
              <DetailSection
                title="Monetary Donation"
                description="Payment information"
                action={<Badge variant="outline">{titleCase(monetary.donation_method)}</Badge>}
                fields={[
                  { label: "Amount", value: formatAmount(monetary.donation_monetary_amount) },
                  { label: "Bank Name", value: monetary.donation_monetary_bank_name },
                  { label: "Reference Number", value: monetary.donation_monetary_reference_number },
                  { label: "Reference Date", value: formatDate(monetary.donation_monetary_reference_date) },
                  { label: "PAN", value: maskId(monetary.donor_pan_number), hidden: !monetary.donor_pan_number },
                  { label: "Aadhaar", value: maskId(monetary.donor_aadhaar_number), hidden: !monetary.donor_aadhaar_number },
                  { label: "Remarks", value: monetary.donation_monetary_remarks, full: true },
                ]}
              />
            )}

            {inkind.length > 0 && (
              <DetailSection
                title="In-Kind Items"
                description={donation.stored_at ? `Stored at ${donation.stored_at}` : "Items donated"}
                action={<Badge variant="outline">{inkind.length} {inkind.length === 1 ? "item" : "items"}</Badge>}
              >
                <ResizableTable
                  columns={[
                    { id: "index", label: "#", size: 5 },
                    { id: "item", label: "Item", size: 10 },
                    { id: "type", label: "Type", size: 10 },
                    { id: "measurement", label: "Measurement", size: 10 },
                    { id: "qty", label: "Qty", size: 10, className: "justify-end" },
                    { id: "value", label: "Value", size: 10, className: "justify-end" },
                  ]}
                >
                  <TableBody>
                    {inkind.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.item_title}</TableCell>
                        <TableCell><Badge variant="secondary">{titleCase(item.item_type)}</Badge></TableCell>
                        <TableCell>{item.measurement ? `${Number(item.measurement)} ${item.measurement_unit ?? ""}`.trim() : "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatAmount(item.estimated_value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5}>Total Estimated Value</TableCell>
                      <TableCell className="text-right tabular-nums">{formatAmount(inkindTotal)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </ResizableTable>
              </DetailSection>
            )}
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
