import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Pencil } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailColumns, DetailPage, DetailSection, formatDetailDate } from "@/components/ui/detail-page"

import { fetchModuleById } from "../moduleThunks"
import type { Module } from "../moduleTypes"

export default function ViewModule() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    dispatch(fetchModuleById(id))
      .then((result) => {
        if (fetchModuleById.fulfilled.match(result)) setModule(result.payload)
      })
      .finally(() => setLoading(false))
  }, [dispatch, id])

  return (
    <DetailPage
      title={module?.module_name ?? "Module Details"}
      description={module?.module_code ?? "Module record details"}
      badges={module && <Badge variant={module.status === "active" ? "default" : "destructive"} className="capitalize">{module.status}</Badge>}
      actions={
        module && (
          <Button render={<Link to={`/modules/edit/${module.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={loading}
      empty={!module && "Module not found."}
    >
      {module && (
        <DetailColumns
          aside={
            <DetailSection
              title="Record Information"
              fields={[
                { label: "Created At", value: formatDetailDate(module.created_at, true) },
                { label: "Last Updated", value: formatDetailDate(module.updated_at, true) },
              ]}
            />
          }
        >
          <DetailSection
            title="Module Details"
            fields={[
              { label: "Module Code", value: module.module_code },
              { label: "Module Name", value: module.module_name },
              { label: "Module Type", value: <span className="capitalize">{module.module_type}</span> },
              { label: "Capacity Type", value: <span className="capitalize">{module.capacity_type ?? "-"}</span>, hidden: module.module_type !== "capacity" },
              { label: "Consumable Type", value: <span className="capitalize">{module.consumable_type ?? "-"}</span>, hidden: module.module_type !== "consumable" },
              { label: "Display Order", value: module.display_order },
              { label: "Status", value: <span className="capitalize">{module.status}</span> },
            ]}
          />
        </DetailColumns>
      )}
    </DetailPage>
  )
}
