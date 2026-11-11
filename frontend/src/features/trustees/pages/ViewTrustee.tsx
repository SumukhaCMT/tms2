import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { Pencil } from "lucide-react"

import type { AppDispatch, RootState } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailColumns, DetailPage, DetailSection } from "@/components/ui/detail-page"

import { fetchTrusteeById } from "../trusteeThunks"

export default function ViewTrustee() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedTrustee, detailLoading, error } = useSelector((state: RootState) => state.trustees)
  const trustee = selectedTrustee && selectedTrustee.id === Number(id) ? selectedTrustee : null

  useEffect(() => {
    const trusteeId = Number(id)
    if (Number.isSafeInteger(trusteeId) && trusteeId > 0) void dispatch(fetchTrusteeById(trusteeId))
  }, [dispatch, id])

  return (
    <DetailPage
      title={trustee?.trustee_name ?? "Trustee Details"}
      description={trustee?.trustee_position ?? "Trustee details and contact information"}
      badges={trustee && <Badge variant={trustee.trustee_status === "active" ? "default" : "destructive"} className="capitalize">{trustee.trustee_status}</Badge>}
      actions={
        trustee && (
          <Button render={<Link to={`/trustees/edit/${trustee.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={detailLoading}
      empty={!trustee && (error || "Trustee not found.")}
    >
      {trustee && (
        <DetailColumns
          aside={
            <DetailSection
              title="Listing"
              fields={[
                { label: "Display Order", value: trustee.trustee_display_order },
                { label: "Status", value: <span className="capitalize">{trustee.trustee_status}</span> },
              ]}
            />
          }
        >
          <DetailSection
            title="Trustee Information"
            fields={[
              { label: "Name", value: trustee.trustee_name },
              { label: "Position", value: trustee.trustee_position },
              { label: "Email", value: trustee.trustee_email },
              { label: "Phone", value: trustee.trustee_phone },
            ]}
          />
          <DetailSection
            title="Address"
            fields={[
              { label: "Address Line 1", value: trustee.trustee_address_line1 },
              { label: "Address Line 2", value: trustee.trustee_address_line2 },
              { label: "City", value: trustee.trustee_city },
              { label: "State", value: trustee.trustee_state },
              { label: "Country", value: trustee.trustee_country },
              { label: "PIN Code", value: trustee.trustee_pincode },
            ]}
          />
        </DetailColumns>
      )}
    </DetailPage>
  )
}
