import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { Pencil } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailColumns, DetailPage, DetailSection, formatDetailDate } from "@/components/ui/detail-page"
import { useModulePermissions } from "@/hooks/useModulePermissions"

import { fetchTemple } from "../templeThunks"
import { selectSelectedTemple, selectTempleDetailsError, selectTempleDetailsLoading } from "../templeSelectors"

export default function ViewTemple() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const selected = useSelector(selectSelectedTemple)
  const loading = useSelector(selectTempleDetailsLoading)
  const error = useSelector(selectTempleDetailsError)
  const { canEdit } = useModulePermissions("temples")
  const temple = selected && String(selected.id) === id ? selected : null

  useEffect(() => {
    const templeId = Number(id)
    if (Number.isInteger(templeId)) void dispatch(fetchTemple(templeId))
  }, [dispatch, id])

  return (
    <DetailPage
      title={temple?.temp_name ?? "Temple Details"}
      description={temple?.temp_legal_name || "Temple record details"}
      badges={
        temple && (
          <>
            {temple.temp_is_primary && <Badge variant="secondary">Primary</Badge>}
            <Badge variant={temple.temp_status === "active" ? "default" : "destructive"} className="capitalize">{temple.temp_status}</Badge>
          </>
        )
      }
      actions={
        temple &&
        canEdit && (
          <Button render={<Link to={`/temples/edit/${temple.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={loading && !temple}
      empty={!temple && (error || "Temple not found.")}
    >
      {temple && (
        <DetailColumns
          aside={
            <>
              <DetailSection
                title="Settings"
                fields={[
                  { label: "Timezone", value: temple.temp_timezone },
                  { label: "Primary Temple", value: temple.temp_is_primary ? "Yes" : "No" },
                  { label: "Latitude", value: temple.temp_lat },
                  { label: "Longitude", value: temple.temp_lng },
                ]}
              />
              <DetailSection
                title="Record Information"
                fields={[
                  { label: "Created At", value: formatDetailDate(temple.created_at, true) },
                  { label: "Last Updated", value: formatDetailDate(temple.updated_at, true) },
                ]}
              />
            </>
          }
        >
          <DetailSection
            title="Temple Details"
            fields={[
              { label: "Temple Name", value: temple.temp_name },
              { label: "Legal Name", value: temple.temp_legal_name },
              { label: "Registration Number", value: temple.temp_registration_number },
              { label: "GST Number", value: temple.temp_gst_number },
              { label: "Email", value: temple.temp_email },
              { label: "Phone", value: temple.temp_phone },
            ]}
          />
          <DetailSection
            title="Address"
            fields={[
              { label: "Address Line 1", value: temple.temp_address_line1 },
              { label: "Address Line 2", value: temple.temp_address_line2 },
              { label: "City", value: temple.temp_city },
              { label: "State", value: temple.temp_state },
              { label: "Country", value: temple.temp_country },
              { label: "PIN Code", value: temple.temp_pincode },
            ]}
          />
        </DetailColumns>
      )}
    </DetailPage>
  )
}
