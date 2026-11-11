import { Link, useParams } from "react-router-dom"
import { Banknote, CalendarDays, Package, Users, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useModulePermissions } from "@/hooks/useModulePermissions"
import { Separator } from "@/components/ui/separator"
import { TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailGrid, DetailMessage, DetailPage, DetailSection, DetailStats } from "@/components/ui/detail-page"

import { useHundiView } from "./useHundiView"

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })

function formatAmount(value: number | null) {
  return value === null ? "-" : currency.format(Number(value))
}

function formatDateTime(value: string | null) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function HundiViewPage() {
  const { id } = useParams<{ id: string }>()
  const { canEdit } = useModulePermissions("hundi")
  const hundiId = Number(id)
  const { hundi, imageUrl, isLoading, totalCash } = useHundiView(Number.isFinite(hundiId) ? hundiId : null)
  const witnesses = hundi ? [hundi, ...(hundi.extra_witnesses ?? [])] : []

  return (
    <DetailPage
      title={hundi ? `${hundi.hundi_number} - ${hundi.hundi_name}` : "Hundi Details"}
      description={hundi ? `${hundi.temp_name} · ${hundi.deity_name}` : "Hundi record details"}
      badges={
        hundi && (
          <Badge variant={hundi.signed_receipt_pdf_path ? "default" : "outline"}>
            {hundi.signed_receipt_pdf_path ? "Signed receipt uploaded" : "Signed receipt pending"}
          </Badge>
        )
      }
      actions={
        hundi &&
        canEdit && (
          <Button render={<Link to={`/hundi/edit/${hundi.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={isLoading}
      empty={!hundi && "Hundi details are not available."}
    >
      {hundi && (
        <>
          <DetailStats
            items={[
              { label: "Total Cash", value: formatAmount(totalCash), icon: Banknote },
              { label: "Items", value: hundi.items.length, icon: Package },
              { label: "Witnesses", value: witnesses.length, icon: Users },
              { label: "Opened At", value: formatDateTime(hundi.opened_at), icon: CalendarDays },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Basic Details"
                  fields={[
                    { label: "Temple", value: hundi.temp_name },
                    { label: "Deity", value: hundi.deity_name },
                    { label: "Hundi Number", value: hundi.hundi_number },
                    { label: "Hundi Name", value: hundi.hundi_name },
                  ]}
                />
                {imageUrl && <DetailSection title="Hundi Image" image={{ src: imageUrl, alt: `${hundi.hundi_number} - ${hundi.hundi_name}` }} />}
                <DetailSection
                  title="Summary & Remarks"
                  fields={[
                    { label: "Summary", value: hundi.summary, full: true },
                    { label: "General Remark", value: hundi.general_remark, full: true },
                  ]}
                />
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created By", value: hundi.created_by_name, hidden: !hundi.created_by_name },
                    { label: "Created At", value: formatDateTime(hundi.created_at) },
                    { label: "Last Updated", value: formatDateTime(hundi.updated_at) },
                    { label: "Signed Receipt Uploaded", value: formatDateTime(hundi.signed_receipt_uploaded_at) },
                  ]}
                />
              </>
            }
          >
            <DetailSection title="Collection" description="Cash denominations and items found in the hundi">
              <Tabs defaultValue="denominations">
                <TabsList>
                  <TabsTrigger value="denominations">Denominations ({hundi.denominations.length})</TabsTrigger>
                  <TabsTrigger value="items">Items ({hundi.items.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="denominations" className="pt-4">
                  {hundi.denominations.length === 0 ? (
                    <DetailMessage>No denominations recorded.</DetailMessage>
                  ) : (
                    <ResizableTable
                      columns={[
                        { id: "type", label: "Type", size: 10 },
                        { id: "denomination", label: "Denomination", size: 10 },
                        { id: "quantity", label: "Quantity", size: 10, className: "justify-end" },
                        { id: "amount", label: "Amount", size: 10, className: "justify-end" },
                      ]}
                    >
                      <TableBody>
                        {hundi.denominations.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell><Badge variant="secondary" className="capitalize">{row.type}</Badge></TableCell>
                            <TableCell>{formatAmount(row.denomination)}</TableCell>
                            <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(row.total_amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell className="text-right tabular-nums">{formatAmount(totalCash)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </ResizableTable>
                  )}
                </TabsContent>
                <TabsContent value="items" className="pt-4">
                  {hundi.items.length === 0 ? (
                    <DetailMessage>No items recorded.</DetailMessage>
                  ) : (
                    <ResizableTable
                      columns={[
                        { id: "item", label: "Item", size: 10 },
                        { id: "qty", label: "Qty", size: 10, className: "justify-end" },
                        { id: "measurement", label: "Measurement", size: 10 },
                        { id: "approx-value", label: "Approx. Value", size: 10, className: "justify-end" },
                        { id: "exact-value", label: "Exact Value", size: 10, className: "justify-end" },
                      ]}
                    >
                      <TableBody>
                        {hundi.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item_name}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                            <TableCell>{item.measurement_weight !== null ? `${Number(item.measurement_weight)} ${item.measurement ?? ""}` : "-"}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(item.approximate_value)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(item.exact_value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </ResizableTable>
                  )}
                </TabsContent>
              </Tabs>
            </DetailSection>

            <DetailSection
              title="Witness Details"
              description="People present when the hundi was opened"
              action={<Badge variant="outline">{witnesses.length} {witnesses.length === 1 ? "witness" : "witnesses"}</Badge>}
              contentClassName="space-y-6"
            >
              {witnesses.map((witness, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator />}
                  {witnesses.length > 1 && <Badge variant="secondary">Witness {index + 1}</Badge>}
                  <DetailGrid
                    items={[
                      { label: "Full Name", value: witness.witness_full_name },
                      { label: "Designation", value: witness.witness_designation },
                      { label: "Email", value: witness.witness_email },
                      { label: "Phone", value: witness.witness_phone },
                      { label: "Address", value: [witness.witness_address_line1, witness.witness_address_line2, witness.witness_city].filter(Boolean).join(", "), full: true },
                      { label: "Remarks", value: witness.witness_remarks, full: true },
                    ]}
                  />
                </div>
              ))}
            </DetailSection>
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
