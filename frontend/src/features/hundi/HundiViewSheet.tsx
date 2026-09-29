import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

import { useHundiView } from "./useHundiView"

interface HundiViewSheetProps {
  hundiId: number | null
  onClose: () => void
}

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })

function formatAmount(value: number | null) {
  return value === null ? "-" : currency.format(Number(value))
}

function formatDateTime(value: string | null) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default function HundiViewSheet({ hundiId, onClose }: HundiViewSheetProps) {
  const { hundi, imageUrl, isLoading, totalCash } = useHundiView(hundiId)

  const witnesses = hundi ? [hundi, ...(hundi.extra_witnesses ?? [])] : []

  return (
    <Sheet open={hundiId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>
            {hundi ? `${hundi.hundi_number} - ${hundi.hundi_name}` : "Hundi Details"}
          </SheetTitle>
          <SheetDescription>
            {hundi ? `${hundi.temp_name} · ${hundi.deity_name}` : "Loading hundi information"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <DetailSkeleton />
        ) : !hundi ? (
          <p className="px-4 text-sm text-muted-foreground">Hundi details are not available.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Basic Details</CardTitle>
                <Badge variant={hundi.signed_receipt_pdf_path ? "default" : "outline"}>
                  {hundi.signed_receipt_pdf_path ? "Signed receipt uploaded" : "Signed receipt pending"}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <DetailField label="Temple" value={hundi.temp_name} />
                <DetailField label="Deity" value={hundi.deity_name} />
                <DetailField label="Hundi Number" value={hundi.hundi_number} />
                <DetailField label="Hundi Name" value={hundi.hundi_name} />
                <DetailField label="Opened At" value={formatDateTime(hundi.opened_at)} />
                <DetailField label="Total Cash" value={formatAmount(totalCash)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Witness Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {witnesses.map((witness, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    {witnesses.length > 1 && (
                      <p className="col-span-2 text-xs font-medium text-muted-foreground">Witness {index + 1}</p>
                    )}
                    <DetailField label="Full Name" value={witness.witness_full_name} />
                    <DetailField label="Designation" value={witness.witness_designation} />
                    <DetailField label="Email" value={witness.witness_email} />
                    <DetailField label="Phone" value={witness.witness_phone} />
                    <div className="col-span-2">
                      <DetailField
                        label="Address"
                        value={[witness.witness_address_line1, witness.witness_address_line2, witness.witness_city].filter(Boolean).join(", ")}
                      />
                    </div>
                    <div className="col-span-2">
                      <DetailField label="Remarks" value={witness.witness_remarks} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Denominations</CardTitle>
              </CardHeader>
              <CardContent>
                {hundi.denominations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No denominations recorded.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Denomination</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hundi.denominations.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{row.type}</Badge>
                          </TableCell>
                          <TableCell>{formatAmount(row.denomination)}</TableCell>
                          <TableCell className="text-right">{row.quantity}</TableCell>
                          <TableCell className="text-right">{formatAmount(row.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{formatAmount(totalCash)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                {hundi.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items recorded.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>Measurement</TableHead>
                        <TableHead className="text-right">Approx. Value</TableHead>
                        <TableHead className="text-right">Exact Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hundi.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell>
                            {item.measurement_weight !== null
                              ? `${Number(item.measurement_weight)} ${item.measurement ?? ""}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">{formatAmount(item.approximate_value)}</TableCell>
                          <TableCell className="text-right">{formatAmount(item.exact_value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Hundi Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={imageUrl}
                    alt={`${hundi.hundi_number} - ${hundi.hundi_name}`}
                    className="max-h-80 w-full rounded-md border object-contain"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Summary & Remarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailField label="Summary" value={hundi.summary} />
                <Separator />
                <DetailField label="General Remark" value={hundi.general_remark} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {hundi.created_by_name && <DetailField label="Created By" value={hundi.created_by_name} />}
                <DetailField label="Created At" value={formatDateTime(hundi.created_at)} />
                <DetailField label="Last Updated" value={formatDateTime(hundi.updated_at)} />
                <DetailField label="Signed Receipt Uploaded" value={formatDateTime(hundi.signed_receipt_uploaded_at)} />
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
