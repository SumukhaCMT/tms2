import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { BadgeCheck, Landmark, Pencil, Receipt, Save, Users, X } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StateSelect } from "@/components/ui/state-select"
import { Label } from "@/components/ui/label"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailMessage, DetailPage, DetailSection, DetailStats, formatDetailDate } from "@/components/ui/detail-page"

import { fetchOrganizationById, updateOrganization, updateOrganizationSubscription } from "../organizationThunks"
import { selectSelectedOrganization, selectOrganizationDetailsLoading, selectOrganizationError } from "../organizationSelectors"
import type { OrganizationDetails, OrganizationSubscription } from "../organizationsTypes"

type OrgField = keyof OrganizationDetails
type SectionKey = "organization" | "contact" | "legal"
type Subscription = OrganizationSubscription & { plan_name?: string | null; bundle_name?: string | null; plan_code?: string | null; bundle_code?: string | null }

const SECTIONS: Record<SectionKey, { field: OrgField; label: string; type?: string }[]> = {
  organization: [
    { field: "org_name", label: "Organization Name" },
    { field: "org_slug", label: "Slug" },
    { field: "org_timezone", label: "Timezone" },
    { field: "org_status", label: "Status" },
    { field: "org_country", label: "Country" },
  ],
  contact: [
    { field: "org_email", label: "Email", type: "email" },
    { field: "org_phone", label: "Phone" },
    { field: "org_legal_name", label: "Legal Name" },
  ],
  legal: [
    { field: "org_registration_number", label: "Registration Number" },
    { field: "org_gst_number", label: "GST Number" },
    { field: "org_address_line1", label: "Address Line 1" },
    { field: "org_address_line2", label: "Address Line 2" },
    { field: "org_city", label: "City" },
    { field: "org_state", label: "State" },
    { field: "org_pincode", label: "Pincode" },
    { field: "org_country", label: "Country" },
  ],
}

const SUBSCRIPTION_FIELDS = ["granted_quantity", "remaining_quantity", "start_date", "expiry_date"] as const

const capitalize = (value?: string | null) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "-")

export default function ViewOrganizations() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const data = useSelector(selectSelectedOrganization)
  const loading = useSelector(selectOrganizationDetailsLoading)
  const error = useSelector(selectOrganizationError)
  const [editing, setEditing] = useState<SectionKey | number | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const organization = data && String(data.organization.id) === id ? data.organization : null
  const subscriptions = (organization ? data?.subscriptions ?? [] : []) as Subscription[]

  useEffect(() => {
    if (id) dispatch(fetchOrganizationById(id))
  }, [dispatch, id])

  function startSection(section: SectionKey) {
    if (!organization) return
    setForm(Object.fromEntries(SECTIONS[section].map(({ field }) => [field, String(organization[field] ?? "")])))
    setEditing(section)
  }

  function startSubscription(subscription: Subscription) {
    setForm({
      granted_quantity: String(subscription.granted_quantity ?? ""),
      remaining_quantity: String(subscription.remaining_quantity ?? ""),
      start_date: subscription.start_date?.substring(0, 10) ?? "",
      expiry_date: subscription.expiry_date?.substring(0, 10) ?? "",
    })
    setEditing(Number(subscription.id))
  }

  async function save() {
    if (!organization || editing === null || !id) return
    setSaving(true)
    try {
      if (typeof editing === "number") {
        await dispatch(
          updateOrganizationSubscription({
            id: editing,
            granted_quantity: form.granted_quantity ? Number(form.granted_quantity) : undefined,
            remaining_quantity: form.remaining_quantity ? Number(form.remaining_quantity) : undefined,
            start_date: form.start_date || undefined,
            expiry_date: form.expiry_date || undefined,
          }),
        ).unwrap()
      } else {
        await dispatch(updateOrganization({ id: organization.id, ...form })).unwrap()
      }
      showCmtToast("success", typeof editing === "number" ? "Subscription updated successfully." : "Organization updated successfully.")
      await dispatch(fetchOrganizationById(id)).unwrap()
      setEditing(null)
    } catch (err) {
      showCmtToast("expiry", typeof err === "string" ? err : "Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const editActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={saving} onClick={() => setEditing(null)}>
        <X /> Cancel
      </Button>
      <Button size="sm" disabled={saving} onClick={() => void save()}>
        <Save /> {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  )

  const editButton = (onClick: () => void) => (
    <Button variant="outline" size="sm" disabled={editing !== null} onClick={onClick}>
      <Pencil /> Edit
    </Button>
  )

  const input = (field: string, type = "text", className?: string) => (
    <Input type={type} className={className} value={form[field] ?? ""} onChange={(event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))} />
  )

  const section = (key: SectionKey, title: string, description?: string) =>
    organization && (
      <DetailSection
        title={title}
        description={description}
        action={editing === key ? editActions : editButton(() => startSection(key))}
        fields={
          editing === key
            ? undefined
            : SECTIONS[key].map(({ field, label }) => ({
                label,
                value: field === "org_status" ? capitalize(organization.org_status) : organization[field],
              }))
        }
      >
        {editing === key && (
          <div className="grid gap-4 @md:grid-cols-2">
            {SECTIONS[key].map(({ field, label, type }) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                {field === "org_state" ? (
                  <StateSelect value={form[field]} onChange={(value) => setForm((previous) => ({ ...previous, [field]: value }))} />
                ) : (
                  input(field, type)
                )}
              </div>
            ))}
          </div>
        )}
      </DetailSection>
    )

  return (
    <DetailPage
      title={organization?.org_name ?? "Organization"}
      description={organization ? organization.org_slug : "Organization details"}
      badges={organization && <Badge variant={organization.org_status === "active" ? "default" : "secondary"}>{capitalize(organization.org_status)}</Badge>}
      isLoading={loading && !organization}
      empty={!organization && (error || "Organization not found.")}
    >
      {organization && data && (
        <>
          <DetailStats
            items={[
              { label: "Temples", value: data.temples?.length ?? 0, icon: Landmark },
              { label: "Users", value: data.users?.length ?? 0, icon: Users },
              { label: "Subscriptions", value: subscriptions.length, icon: BadgeCheck },
              { label: "Orders", value: data.orders?.length ?? 0, icon: Receipt },
            ]}
          />

          <DetailColumns
            aside={
              <>
                {section("contact", "Contact Information")}
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created At", value: formatDetailDate(organization.created_at, true) },
                    { label: "Last Updated", value: formatDetailDate(organization.updated_at, true) },
                  ]}
                />
              </>
            }
          >
            {section("organization", "Organization", "Basic organization settings")}
            {section("legal", "Legal & Address", "Registration and billing address")}

            <DetailSection
              title="Subscriptions"
              description="Plans and bundles active for this organization"
              action={<Badge variant="outline">{subscriptions.length} total</Badge>}
            >
              {subscriptions.length === 0 ? (
                <DetailMessage>No subscriptions found.</DetailMessage>
              ) : (
                <ResizableTable
                  columns={[
                    { id: "name", label: "Subscription", size: 16 },
                    { id: "granted", label: "Granted", size: 8 },
                    { id: "remaining", label: "Remaining", size: 8 },
                    { id: "start", label: "Start Date", size: 11 },
                    { id: "expiry", label: "Expiry Date", size: 11 },
                    { id: "actions", label: "Actions", size: 10, className: "justify-end" },
                  ]}
                >
                  <TableBody>
                    {subscriptions.map((subscription) => {
                      const isEditing = editing === Number(subscription.id)
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.plan_name ?? subscription.bundle_name ?? `${capitalize(subscription.subscription_type)} #${subscription.plan_id ?? subscription.bundle_id ?? subscription.id}`}</div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {subscription.plan_code ?? subscription.bundle_code ?? capitalize(subscription.license_type)}
                              {subscription.subscription_status && <Badge variant="secondary" className="capitalize">{subscription.subscription_status}</Badge>}
                            </div>
                          </TableCell>
                          {isEditing ? (
                            SUBSCRIPTION_FIELDS.map((field) => (
                              <TableCell key={field}>{input(field, field.endsWith("date") ? "date" : "number", "h-8")}</TableCell>
                            ))
                          ) : (
                            <>
                              <TableCell className="tabular-nums">{subscription.granted_quantity ?? "-"}</TableCell>
                              <TableCell className="tabular-nums">{subscription.remaining_quantity ?? "-"}</TableCell>
                              <TableCell>{formatDetailDate(subscription.start_date)}</TableCell>
                              <TableCell>{formatDetailDate(subscription.expiry_date)}</TableCell>
                            </>
                          )}
                          <TableCell className="text-right">
                            {isEditing ? editActions : <div className="flex justify-end">{editButton(() => startSubscription(subscription))}</div>}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </ResizableTable>
              )}
            </DetailSection>
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
