import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { Pencil } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailColumns, DetailPage, DetailSection, DetailText, formatDetailDate } from "@/components/ui/detail-page"
import { useImageUrl } from "@/hooks/useImageUrl"
import { useModulePermissions } from "@/hooks/useModulePermissions"

import { fetchTemples } from "../../temple/templeThunks"
import { selectTemples } from "../../temple/templeSelectors"
import { selectDeitiesError, selectDeitiesLoading, selectSelectedDeity } from "../deitySelectors"
import { clearSelectedDeity } from "../deitySlice"
import { fetchDeityById } from "../deityThunks"

export default function ViewDeity() {
  const { id } = useParams<{ id: string }>()
  const deityId = Number(id)
  const dispatch = useDispatch<AppDispatch>()
  const { canEdit } = useModulePermissions("Deities")
  const selected = useSelector(selectSelectedDeity)
  const loading = useSelector(selectDeitiesLoading)
  const error = useSelector(selectDeitiesError)
  const temples = useSelector(selectTemples)
  const deity = selected?.id === deityId ? selected : null
  const imageUrl = useImageUrl(deity?.deity_img_name ? `/v1/deities/${deityId}/image` : null)
  const templeName = temples?.find((temple) => Number(temple.id) === Number(deity?.temple_id))?.temp_name

  useEffect(() => {
    if (Number.isSafeInteger(deityId) && deityId > 0) void dispatch(fetchDeityById(deityId))
    void dispatch(fetchTemples())
    return () => {
      dispatch(clearSelectedDeity())
    }
  }, [dispatch, deityId])

  return (
    <DetailPage
      title={deity?.deity_name ?? "Deity Details"}
      description={templeName ?? "Deity details and temple settings"}
      badges={
        deity && (
          <Badge variant={deity.deity_status === "active" ? "default" : "destructive"} className="capitalize">
            {deity.deity_status}
          </Badge>
        )
      }
      actions={
        deity &&
        canEdit && (
          <Button render={<Link to={`/deities/edit/${deity.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={loading && !deity}
      empty={!deity && (error || "Deity not found.")}
    >
      {deity && (
        <DetailColumns
          aside={
            <DetailSection
              title="Listing"
              image={imageUrl ? { src: imageUrl, alt: deity.deity_name } : undefined}
              fields={[
                { label: "Default", value: deity.deity_is_default === "yes" ? "Yes" : "No" },
                { label: "Display Order", value: deity.deity_display_order },
                { label: "Status", value: <span className="capitalize">{deity.deity_status}</span> },
              ]}
            />
          }
        >
          <DetailSection
            title="Deity Information"
            fields={[
              { label: "Name", value: deity.deity_name },
              { label: "Code", value: deity.deity_code },
              { label: "Temple", value: templeName ?? `Temple #${deity.temple_id}` },
              { label: "Created On", value: formatDetailDate(deity.created_at, true) },
              { label: "Last Updated", value: formatDetailDate(deity.updated_at, true) },
            ]}
          />
          <DetailSection title="Description">
            <DetailText>{deity.deity_description}</DetailText>
          </DetailSection>
        </DetailColumns>
      )}
    </DetailPage>
  )
}
