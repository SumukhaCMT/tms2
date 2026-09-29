import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { SummaryRow } from "@/features/donations/shared/DonationFormFields"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { itemTypePlainLabel, formatUsedDateDisplay, formatStockAmount, type InventoryUsedDetailApi } from "./inventoryUsageTypes"

export default function ViewInventoryUsage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [record, setRecord] = useState<InventoryUsedDetailApi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let active = true

    async function loadRecord() {
      try {
        const res = await api.get(`/v1/inventory-used/${id}`)
        const detail = res?.data?.data as InventoryUsedDetailApi | undefined
        if (active && detail) setRecord(detail)
      } catch {
        if (active) {
          showCmtToast("expiry", "Failed to load the usage record. Please try again.")
          navigate("/inventory/usage")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadRecord()
    return () => {
      active = false
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!record) return null

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/inventory/usage" />} className="mb-2 -ml-2">
          <ArrowLeft className="size-4" /> Back to Stock Usage
        </Button>
        <h2 className="text-lg font-semibold">Usage Record</h2>
        <p className="text-sm text-muted-foreground">Transaction: {record.transaction_number}</p>
      </div>

      <Card size="sm">
        <CardHeader>
          <p className="text-sm font-medium">{record.item_name}</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryRow label="Item Type" value={itemTypePlainLabel(record.item_type)} />
          <SummaryRow label="Total Stock" value={formatStockAmount(record.total_stock, record.stock_unit_name, record.stock_measurement)} />
          <SummaryRow label="Total Used" value={formatStockAmount(record.total_used, record.stock_unit_name, record.stock_measurement)} />
          <SummaryRow label="Total Remaining" value={formatStockAmount(record.total_remaining, record.stock_unit_name, record.stock_measurement)} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <p className="text-sm font-medium">Usage Details</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryRow label="Quantity Used" value={String(record.used_quantity)} />
          <SummaryRow label="Measurement Unit" value={record.unit_name} />
          <SummaryRow label="Units Used" value={record.used_measurement ? String(record.used_measurement) : "—"} />
          <SummaryRow label="Used At" value={record.used_where} />
          <SummaryRow label="Used Date" value={formatUsedDateDisplay(record.used_date)} />
          <SummaryRow label="Used By" value={record.used_by_name} />
          <SummaryRow label="Remarks" value={record.remarks || "—"} />
        </CardContent>
      </Card>
    </div>
  )
}
