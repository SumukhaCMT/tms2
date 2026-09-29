import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useDonationView } from "./useDonationView"

interface DonationViewSheetProps {
  donationId: number | null
  onClose: () => void
}

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

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{value || "-"}</div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default function DonationViewSheet({ donationId, onClose }: DonationViewSheetProps) {
  const { donation, isLoading, inkindTotal } = useDonationView(donationId)
  const monetary = donation?.donation_monetary ?? null
  const donorAddress = [
    donation?.donor_address_line1,
    donation?.donor_address_line2,
    donation?.donor_city,
    donation?.donor_state,
    donation?.donor_pincode,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Sheet open={donationId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>{donation ? donation.donation_number : "Donation Details"}</SheetTitle>
          <SheetDescription>
            {donation ? `${donation.temp_name} · ${donation.donor_name}` : "Loading donation information"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <DetailSkeleton />
        ) : !donation ? (
          <p className="px-4 text-sm text-muted-foreground">Donation details are not available.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            <Card>
              <CardHeader>
                <CardTitle>Donor Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField label="Donor Name" value={donation.donor_name} />
                <DetailField label="Phone" value={donation.donor_phone} />
                <DetailField label="Email" value={donation.donor_email} />
                <DetailField label="Temple" value={donation.temp_name} />
                <div className="col-span-2">
                  <DetailField label="Address" value={donorAddress} />
                </div>
              </CardContent>
            </Card>

            {monetary && (
              <Card>
                <CardHeader>
                  <CardTitle>Monetary Donation</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <DetailField label="Amount" value={formatAmount(monetary.donation_monetary_amount)} />
                  <DetailField label="Payment Method" value={titleCase(monetary.donation_method)} />
                  <DetailField label="Bank Name" value={monetary.donation_monetary_bank_name} />
                  <DetailField label="Reference Number" value={monetary.donation_monetary_reference_number} />
                  <DetailField label="Reference Date" value={formatDate(monetary.donation_monetary_reference_date)} />
                  {monetary.donor_pan_number && <DetailField label="PAN" value={maskId(monetary.donor_pan_number)} />}
                  {monetary.donor_aadhaar_number && (
                    <DetailField label="Aadhaar" value={maskId(monetary.donor_aadhaar_number)} />
                  )}
                  <div className="col-span-2">
                    <DetailField label="Remarks" value={monetary.donation_monetary_remarks} />
                  </div>
                </CardContent>
              </Card>
            )}

            {donation.donation_inkind.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>In-Kind Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Measurement</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donation.donation_inkind.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.item_title}</TableCell>
                            <TableCell>{titleCase(item.item_type)}</TableCell>
                            <TableCell>
                              {item.measurement ? `${Number(item.measurement)} ${item.measurement_unit ?? ""}`.trim() : "-"}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatAmount(item.estimated_value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={5}>Total Estimated Value</TableCell>
                          <TableCell className="text-right">{formatAmount(inkindTotal)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                  {donation.stored_at && (
                    <div className="mt-4">
                      <DetailField label="Stored At" value={donation.stored_at} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Receiver Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField label="Receiver Name" value={donation.receiver_name} />
                <DetailField label="Designation" value={donation.receiver_designation} />
                <DetailField label="Phone" value={donation.receiver_phone} />
                <div className="col-span-2">
                  <DetailField label="Overall Remarks" value={donation.overall_remarks} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record Info</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {donation.created_by_name && <DetailField label="Created By" value={donation.created_by_name} />}
                <DetailField label="Created At" value={formatDate(donation.created_at, true)} />
                <DetailField label="Last Updated" value={formatDate(donation.updated_at, true)} />
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
