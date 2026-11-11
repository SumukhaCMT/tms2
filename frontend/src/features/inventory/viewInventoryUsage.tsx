import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Boxes, PackageCheck, PackageMinus } from "lucide-react"

import api from "@/axios/axios"
import { Badge } from "@/components/ui/badge"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { DetailColumns, DetailPage, DetailSection, DetailStats, DetailText } from "@/components/ui/detail-page"

import { itemTypePlainLabel, formatUsedDateDisplay, formatStockAmount, type InventoryUsedDetailApi } from "./inventoryUsageTypes"

export default function ViewInventoryUsage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<InventoryUsedDetailApi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let active = true

    api
      .get(`/v1/inventory-used/${id}`)
      .then((res) => {
        const detail = res?.data?.data as InventoryUsedDetailApi | undefined
        if (active && detail) setRecord(detail)
      })
      .catch(() => {
        if (!active) return
        showCmtToast("expiry", "Failed to load the usage record. Please try again.")
        navigate("/inventory/usage")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, navigate])

  const stock = (value: number) => (record ? formatStockAmount(value, record.stock_unit_name, record.stock_measurement) : "-")

  return (
    <DetailPage
      title={record?.item_name ?? "Usage Record"}
      description={record ? `Transaction ${record.transaction_number}` : "Stock usage details"}
      badges={record && <Badge variant="secondary">{itemTypePlainLabel(record.item_type)}</Badge>}
      isLoading={loading}
      empty={!record && "Usage record is not available."}
    >
      {record && (
        <>
          <DetailStats
            items={[
              { label: "Total Stock", value: stock(record.total_stock), icon: Boxes },
              { label: "Total Used", value: stock(record.total_used), icon: PackageMinus },
              { label: "Total Remaining", value: stock(record.total_remaining), icon: PackageCheck },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Item"
                  action={
                    <Badge variant="outline" render={<Link to={`/inventory/view/${record.item_id}`} />}>
                      View item
                    </Badge>
                  }
                  fields={[
                    { label: "Item Name", value: record.item_name },
                    { label: "Item Type", value: itemTypePlainLabel(record.item_type) },
                  ]}
                />
                <DetailSection title="Remarks">
                  <DetailText fallback="No remarks added.">{record.remarks}</DetailText>
                </DetailSection>
              </>
            }
          >
            <DetailSection
              title="Usage Details"
              description="Where and how much of this item was used"
              fields={[
                { label: "Quantity Used", value: record.used_quantity },
                { label: "Measurement Unit", value: record.unit_name },
                { label: "Units Used", value: record.used_measurement },
                { label: "Used At", value: record.used_where },
                { label: "Used Date", value: formatUsedDateDisplay(record.used_date) },
                { label: "Used By", value: record.used_by_name },
              ]}
            />
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
