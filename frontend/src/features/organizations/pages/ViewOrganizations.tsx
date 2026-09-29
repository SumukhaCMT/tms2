"use client"

import { useEffect, useState } from "react"
import { NavLink, useParams } from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import {
  fetchOrganizationById,
  updateOrganization,
  updateOrganizationSubscription,
} from "../organizationThunks"

import {
  selectSelectedOrganization,
  selectOrganizationDetailsLoading,
  selectOrganizationError,
} from "../organizationSelectors"

import type { AppDispatch } from "@/app/store"


/* =========================================================
   TYPES
========================================================= */

type EditingSection =
  | "organization"
  | "contact"
  | "legal"
  | null


interface EditOrganizationState {
  org_name: string
  org_slug: string
  org_timezone: string
  org_status: string
  org_country: string

  org_email: string
  org_phone: string
  org_legal_name: string

  org_registration_number: string
  org_gst_number: string

  org_address_line1: string
  org_address_line2: string
  org_city: string
  org_state: string
  org_pincode: string
}


interface EditSubscriptionState {
  granted_quantity: string
  remaining_quantity: string
  start_date: string
  expiry_date: string
}


interface OrganizationSubscription {
  id: number | string

  plan_name?: string | null
  bundle_name?: string | null
  subscription_name?: string | null

  plan_code?: string | null
  bundle_code?: string | null

  granted_quantity?: number | string | null
  remaining_quantity?: number | string | null

  start_date?: string | null
  expiry_date?: string | null
}


/* =========================================================
   HELPERS
========================================================= */

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}


const capitalize = (
  value?: string | null,
) => {
  if (!value) {
    return "-"
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  )
}


/* =========================================================
   INFO ITEM
========================================================= */

interface InfoItemProps {
  icon?: React.ReactNode
  label: string
  value?: React.ReactNode
}


const InfoItem = ({
  icon,
  label,
  value,
}: InfoItemProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <div className="font-medium">
        {value || "-"}
      </div>
    </div>
  )
}


/* =========================================================
   COMPONENT
========================================================= */

export default function ViewOrganizations() {
  const { id } =
    useParams<{ id: string }>()

  const dispatch =
    useDispatch<AppDispatch>()


  /* =======================================================
     REDUX
  ======================================================= */

  const organizationData =
    useSelector(
      selectSelectedOrganization,
    )

  const loading =
    useSelector(
      selectOrganizationDetailsLoading,
    )

  const error =
    useSelector(
      selectOrganizationError,
    )


  /* =======================================================
     ORGANIZATION
  ======================================================= */

  const organization =
    organizationData?.organization

  const subscriptions =
    (organizationData?.subscriptions ??
      []) as OrganizationSubscription[]


  /* =======================================================
     EDITING STATES
  ======================================================= */

  const [
    editingSection,
    setEditingSection,
  ] =
    useState<EditingSection>(null)


  const [
    organizationSaving,
    setOrganizationSaving,
  ] = useState(false)


  /* =======================================================
     SUBSCRIPTION EDITING
  ======================================================= */

  const [
    editingSubscriptionId,
    setEditingSubscriptionId,
  ] =
    useState<number | null>(null)


  const [
    subscriptionSaving,
    setSubscriptionSaving,
  ] = useState(false)


  /* =======================================================
     ORGANIZATION FORM
  ======================================================= */

  const [
    editOrganization,
    setEditOrganization,
  ] =
    useState<EditOrganizationState>({
      org_name: "",
      org_slug: "",
      org_timezone: "",
      org_status: "",
      org_country: "",

      org_email: "",
      org_phone: "",
      org_legal_name: "",

      org_registration_number: "",
      org_gst_number: "",

      org_address_line1: "",
      org_address_line2: "",
      org_city: "",
      org_state: "",
      org_pincode: "",
    })


  /* =======================================================
     SUBSCRIPTION FORM
  ======================================================= */

  const [
    editSubscription,
    setEditSubscription,
  ] =
    useState<EditSubscriptionState>({
      granted_quantity: "",
      remaining_quantity: "",
      start_date: "",
      expiry_date: "",
    })


  /* =======================================================
     FETCH ORGANIZATION
  ======================================================= */

  useEffect(() => {
    if (!id) {
      return
    }

    dispatch(
      fetchOrganizationById(id),
    )
  }, [dispatch, id])


  /* =======================================================
     RELOAD ORGANIZATION
  ======================================================= */

  const reloadOrganization =
    async () => {
      if (!id) {
        return
      }

      await dispatch(
        fetchOrganizationById(id),
      ).unwrap()
    }


  /* =======================================================
     EDIT ORGANIZATION
  ======================================================= */

  const handleEditOrganization =
    () => {
      if (!organization) {
        return
      }

      setEditOrganization({
        org_name:
          organization.org_name ?? "",

        org_slug:
          organization.org_slug ?? "",

        org_timezone:
          organization.org_timezone ?? "",

        org_status:
          organization.org_status ?? "",

        org_country:
          organization.org_country ?? "",

        org_email:
          organization.org_email ?? "",

        org_phone:
          organization.org_phone ?? "",

        org_legal_name:
          organization.org_legal_name ?? "",

        org_registration_number:
          organization.org_registration_number ??
          "",

        org_gst_number:
          organization.org_gst_number ?? "",

        org_address_line1:
          organization.org_address_line1 ?? "",

        org_address_line2:
          organization.org_address_line2 ?? "",

        org_city:
          organization.org_city ?? "",

        org_state:
          organization.org_state ?? "",

        org_pincode:
          organization.org_pincode ?? "",
      })

      setEditingSection(
        "organization",
      )
    }


  /* =======================================================
     EDIT CONTACT
  ======================================================= */

  const handleEditContact =
    () => {
      if (!organization) {
        return
      }

      setEditOrganization(
        (previous) => ({
          ...previous,

          org_email:
            organization.org_email ?? "",

          org_phone:
            organization.org_phone ?? "",

          org_legal_name:
            organization.org_legal_name ??
            "",
        }),
      )

      setEditingSection("contact")
    }


  /* =======================================================
     EDIT LEGAL
  ======================================================= */

  const handleEditLegal =
    () => {
      if (!organization) {
        return
      }

      setEditOrganization(
        (previous) => ({
          ...previous,

          org_registration_number:
            organization.org_registration_number ??
            "",

          org_gst_number:
            organization.org_gst_number ?? "",

          org_address_line1:
            organization.org_address_line1 ?? "",

          org_address_line2:
            organization.org_address_line2 ?? "",

          org_city:
            organization.org_city ?? "",

          org_state:
            organization.org_state ?? "",

          org_country:
            organization.org_country ?? "",

          org_pincode:
            organization.org_pincode ?? "",
        }),
      )

      setEditingSection("legal")
    }


  /* =======================================================
     CANCEL ORGANIZATION EDIT
  ======================================================= */

  const handleCancelOrganizationEdit =
    () => {
      setEditingSection(null)
    }


  /* =======================================================
     SAVE ORGANIZATION
  ======================================================= */

  const handleSaveOrganization =
    async () => {
      if (!organization) {
        return
      }

      try {
        setOrganizationSaving(true)

        await dispatch(
          updateOrganization({
            id: organization.id,

            org_name:
              editOrganization.org_name,

            org_slug:
              editOrganization.org_slug,

            org_timezone:
              editOrganization.org_timezone,

            org_status:
              editOrganization.org_status,

            org_country:
              editOrganization.org_country,
          }),
        ).unwrap()

        await reloadOrganization()

        setEditingSection(null)

      } catch (error) {
        console.error(
          "Failed to update organization:",
          error,
        )
      } finally {
        setOrganizationSaving(false)
      }
    }


  /* =======================================================
     SAVE CONTACT
  ======================================================= */

  const handleSaveContact =
    async () => {
      if (!organization) {
        return
      }

      try {
        setOrganizationSaving(true)

        await dispatch(
          updateOrganization({
            id: organization.id,

            org_email:
              editOrganization.org_email,

            org_phone:
              editOrganization.org_phone,

            org_legal_name:
              editOrganization.org_legal_name,
          }),
        ).unwrap()

        await reloadOrganization()

        setEditingSection(null)

      } catch (error) {
        console.error(
          "Failed to update contact:",
          error,
        )
      } finally {
        setOrganizationSaving(false)
      }
    }


  /* =======================================================
     SAVE LEGAL
  ======================================================= */

  const handleSaveLegal =
    async () => {
      if (!organization) {
        return
      }

      try {
        setOrganizationSaving(true)

        await dispatch(
          updateOrganization({
            id: organization.id,

            org_registration_number:
              editOrganization.org_registration_number,

            org_gst_number:
              editOrganization.org_gst_number,

            org_address_line1:
              editOrganization.org_address_line1,

            org_address_line2:
              editOrganization.org_address_line2,

            org_city:
              editOrganization.org_city,

            org_state:
              editOrganization.org_state,

            org_country:
              editOrganization.org_country,

            org_pincode:
              editOrganization.org_pincode,
          }),
        ).unwrap()

        await reloadOrganization()

        setEditingSection(null)

      } catch (error) {
        console.error(
          "Failed to update legal information:",
          error,
        )
      } finally {
        setOrganizationSaving(false)
      }
    }


  /* =======================================================
     EDIT SUBSCRIPTION
  ======================================================= */

  const handleEditSubscription =
    (
      subscription: OrganizationSubscription,
    ) => {

      setEditSubscription({
        granted_quantity:
          subscription.granted_quantity !=
          null
            ? String(
                subscription.granted_quantity,
              )
            : "",

        remaining_quantity:
          subscription.remaining_quantity !=
          null
            ? String(
                subscription.remaining_quantity,
              )
            : "",

        start_date:
          subscription.start_date
            ? subscription.start_date.substring(
                0,
                10,
              )
            : "",

        expiry_date:
          subscription.expiry_date
            ? subscription.expiry_date.substring(
                0,
                10,
              )
            : "",
      })

      setEditingSubscriptionId(
        Number(subscription.id),
      )
    }


  /* =======================================================
     CANCEL SUBSCRIPTION
  ======================================================= */

  const handleCancelSubscription =
    () => {

      setEditingSubscriptionId(null)

      setEditSubscription({
        granted_quantity: "",
        remaining_quantity: "",
        start_date: "",
        expiry_date: "",
      })
    }


  /* =======================================================
     SAVE SUBSCRIPTION
  ======================================================= */

  const handleSaveSubscription =
    async () => {

      if (!editingSubscriptionId) {
        return
      }

      try {
        setSubscriptionSaving(true)

        await dispatch(
          updateOrganizationSubscription({
            id: editingSubscriptionId,

            granted_quantity:
              editSubscription.granted_quantity
                ? Number(
                    editSubscription.granted_quantity,
                  )
                : undefined,

            remaining_quantity:
              editSubscription.remaining_quantity
                ? Number(
                    editSubscription.remaining_quantity,
                  )
                : undefined,

            start_date:
              editSubscription.start_date ||
              undefined,

            expiry_date:
              editSubscription.expiry_date ||
              undefined,
          }),
        ).unwrap()

        await reloadOrganization()

        setEditingSubscriptionId(null)

        setEditSubscription({
          granted_quantity: "",
          remaining_quantity: "",
          start_date: "",
          expiry_date: "",
        })

      } catch (error) {
        console.error(
          "Failed to update subscription:",
          error,
        )
      } finally {
        setSubscriptionSaving(false)
      }
    }


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    !organization
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">
          Loading organization...
        </div>
      </div>
    )
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !organization
  ) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            Organization not found.
          </CardContent>
        </Card>
      </div>
    )
  }


  const isActive =
    organization.org_status ===
    "active"


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 p-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2">

            <NavLink
              to="/organizations"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Organizations
            </NavLink>

            <span className="text-muted-foreground">
              /
            </span>

            <span className="text-sm">
              View
            </span>

          </div>

          <h1 className="text-2xl font-bold">
            {organization.org_name}
          </h1>

          <p className="text-sm text-muted-foreground">
            Organization details
          </p>

        </div>


        <Badge
          variant={
            isActive
              ? "default"
              : "secondary"
          }
          className="w-fit"
        >
          {capitalize(
            organization.org_status,
          )}
        </Badge>

      </div>


      {/* ===================================================
          ORGANIZATION
      =================================================== */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2">

            <Building2 className="h-5 w-5" />

            Organization

          </CardTitle>


          {editingSection ===
          "organization" ? (

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleCancelOrganizationEdit
                }
                disabled={
                  organizationSaving
                }
              >
                <X className="mr-2 h-4 w-4" />

                Cancel
              </Button>


              <Button
                size="sm"
                onClick={
                  handleSaveOrganization
                }
                disabled={
                  organizationSaving
                }
              >
                <Save className="mr-2 h-4 w-4" />

                {organizationSaving
                  ? "Saving..."
                  : "Save"}
              </Button>

            </div>

          ) : (

            <Button
              variant="outline"
              size="sm"
              onClick={
                handleEditOrganization
              }
              disabled={
                editingSection !== null ||
                editingSubscriptionId !== null
              }
            >
              <Pencil className="mr-2 h-4 w-4" />

              Edit
            </Button>

          )}

        </CardHeader>


        <CardContent>

          {editingSection ===
          "organization" ? (

            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Organization Name
                </Label>

                <Input
                  value={
                    editOrganization.org_name
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_name:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Organization Slug
                </Label>

                <Input
                  value={
                    editOrganization.org_slug
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_slug:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Timezone
                </Label>

                <Input
                  value={
                    editOrganization.org_timezone
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_timezone:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Status
                </Label>

                <Input
                  value={
                    editOrganization.org_status
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_status:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Country
                </Label>

                <Input
                  value={
                    editOrganization.org_country
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_country:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={
                  <Building2 className="h-4 w-4" />
                }
                label="Organization Name"
                value={
                  organization.org_name
                }
              />

              <InfoItem
                label="Slug"
                value={
                  organization.org_slug
                }
              />

              <InfoItem
                icon={
                  <Globe className="h-4 w-4" />
                }
                label="Timezone"
                value={
                  organization.org_timezone
                }
              />

              <InfoItem
                label="Status"
                value={
                  capitalize(
                    organization.org_status,
                  )
                }
              />

              <InfoItem
                icon={
                  <Globe className="h-4 w-4" />
                }
                label="Country"
                value={
                  organization.org_country
                }
              />

              <InfoItem
                icon={
                  <Calendar className="h-4 w-4" />
                }
                label="Created At"
                value={
                  formatDate(
                    organization.created_at,
                  )
                }
              />

            </div>

          )}

        </CardContent>

      </Card>


      {/* ===================================================
          CONTACT
      =================================================== */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2">

            <Phone className="h-5 w-5" />

            Contact Information

          </CardTitle>


          {editingSection ===
          "contact" ? (

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleCancelOrganizationEdit
                }
                disabled={
                  organizationSaving
                }
              >
                <X className="mr-2 h-4 w-4" />

                Cancel
              </Button>


              <Button
                size="sm"
                onClick={
                  handleSaveContact
                }
                disabled={
                  organizationSaving
                }
              >
                <Save className="mr-2 h-4 w-4" />

                {organizationSaving
                  ? "Saving..."
                  : "Save"}
              </Button>

            </div>

          ) : (

            <Button
              variant="outline"
              size="sm"
              onClick={
                handleEditContact
              }
              disabled={
                editingSection !== null ||
                editingSubscriptionId !== null
              }
            >
              <Pencil className="mr-2 h-4 w-4" />

              Edit
            </Button>

          )}

        </CardHeader>


        <CardContent>

          {editingSection ===
          "contact" ? (

            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Email
                </Label>

                <Input
                  type="email"
                  value={
                    editOrganization.org_email
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_email:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Phone
                </Label>

                <Input
                  value={
                    editOrganization.org_phone
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_phone:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2 md:col-span-2">

                <Label>
                  Legal Name
                </Label>

                <Input
                  value={
                    editOrganization.org_legal_name
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_legal_name:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={
                  <Mail className="h-4 w-4" />
                }
                label="Email"
                value={
                  organization.org_email
                }
              />

              <InfoItem
                icon={
                  <Phone className="h-4 w-4" />
                }
                label="Phone"
                value={
                  organization.org_phone
                }
              />

              <InfoItem
                icon={
                  <FileText className="h-4 w-4" />
                }
                label="Legal Name"
                value={
                  organization.org_legal_name
                }
              />

            </div>

          )}

        </CardContent>

      </Card>


      {/* ===================================================
          LEGAL & ADDRESS
      =================================================== */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2">

            <ShieldCheck className="h-5 w-5" />

            Legal & Address

          </CardTitle>


          {editingSection ===
          "legal" ? (

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleCancelOrganizationEdit
                }
                disabled={
                  organizationSaving
                }
              >
                <X className="mr-2 h-4 w-4" />

                Cancel
              </Button>


              <Button
                size="sm"
                onClick={
                  handleSaveLegal
                }
                disabled={
                  organizationSaving
                }
              >
                <Save className="mr-2 h-4 w-4" />

                {organizationSaving
                  ? "Saving..."
                  : "Save"}
              </Button>

            </div>

          ) : (

            <Button
              variant="outline"
              size="sm"
              onClick={
                handleEditLegal
              }
              disabled={
                editingSection !== null ||
                editingSubscriptionId !== null
              }
            >
              <Pencil className="mr-2 h-4 w-4" />

              Edit
            </Button>

          )}

        </CardHeader>


        <CardContent>

          {editingSection ===
          "legal" ? (

            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Registration Number
                </Label>

                <Input
                  value={
                    editOrganization.org_registration_number
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_registration_number:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  GST Number
                </Label>

                <Input
                  value={
                    editOrganization.org_gst_number
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_gst_number:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2 md:col-span-2">

                <Label>
                  Address Line 1
                </Label>

                <Input
                  value={
                    editOrganization.org_address_line1
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_address_line1:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2 md:col-span-2">

                <Label>
                  Address Line 2
                </Label>

                <Input
                  value={
                    editOrganization.org_address_line2
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_address_line2:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  City
                </Label>

                <Input
                  value={
                    editOrganization.org_city
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_city:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  State
                </Label>

                <Input
                  value={
                    editOrganization.org_state
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_state:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Pincode
                </Label>

                <Input
                  value={
                    editOrganization.org_pincode
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_pincode:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>
                  Country
                </Label>

                <Input
                  value={
                    editOrganization.org_country
                  }
                  onChange={(event) =>
                    setEditOrganization(
                      (previous) => ({
                        ...previous,

                        org_country:
                          event.target.value,
                      }),
                    )
                  }
                />

              </div>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={
                  <FileText className="h-4 w-4" />
                }
                label="Registration Number"
                value={
                  organization.org_registration_number
                }
              />

              <InfoItem
                label="GST Number"
                value={
                  organization.org_gst_number
                }
              />

              <InfoItem
                icon={
                  <MapPin className="h-4 w-4" />
                }
                label="Address Line 1"
                value={
                  organization.org_address_line1
                }
              />

              <InfoItem
                icon={
                  <MapPin className="h-4 w-4" />
                }
                label="Address Line 2"
                value={
                  organization.org_address_line2
                }
              />

              <InfoItem
                label="City"
                value={
                  organization.org_city
                }
              />

              <InfoItem
                label="State"
                value={
                  organization.org_state
                }
              />

              <InfoItem
                label="Pincode"
                value={
                  organization.org_pincode
                }
              />

              <InfoItem
                label="Country"
                value={
                  organization.org_country
                }
              />

            </div>

          )}

        </CardContent>

      </Card>


      {/* ===================================================
          SUBSCRIPTIONS
      =================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <BadgeCheck className="h-5 w-5" />

            Subscriptions

          </CardTitle>

        </CardHeader>


        <CardContent>

          {subscriptions.length === 0 ? (

            <div className="py-8 text-center text-muted-foreground">
              No subscriptions found.
            </div>

          ) : (

            <div className="space-y-4">

              {subscriptions.map(
                (subscription) => {

                  const subscriptionId =
                    Number(
                      subscription.id,
                    )

                  const isEditing =
                    editingSubscriptionId ===
                    subscriptionId


                  return (
                    <div
                      key={subscriptionId}
                      className="rounded-lg border p-5"
                    >

                      {/* =================================
                          SUBSCRIPTION HEADER
                      ================================= */}

                      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div>

                          <h3 className="font-semibold">

                            {subscription.plan_name ??
                              subscription.bundle_name ??
                              subscription.subscription_name ??
                              "Subscription"}

                          </h3>

                          <p className="text-sm text-muted-foreground">

                            {subscription.plan_code ??
                              subscription.bundle_code ??
                              "-"}

                          </p>

                        </div>


                        {isEditing ? (

                          <div className="flex gap-2">

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={
                                handleCancelSubscription
                              }
                              disabled={
                                subscriptionSaving
                              }
                            >

                              <X className="mr-2 h-4 w-4" />

                              Cancel

                            </Button>


                            <Button
                              size="sm"
                              onClick={
                                handleSaveSubscription
                              }
                              disabled={
                                subscriptionSaving
                              }
                            >

                              <Save className="mr-2 h-4 w-4" />

                              {subscriptionSaving
                                ? "Saving..."
                                : "Save"}

                            </Button>

                          </div>

                        ) : (

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEditSubscription(
                                subscription,
                              )
                            }
                            disabled={
                              editingSection !==
                                null ||
                              editingSubscriptionId !==
                                null
                            }
                          >

                            <Pencil className="mr-2 h-4 w-4" />

                            Edit

                          </Button>

                        )}

                      </div>


                      {/* =================================
                          EDIT MODE
                      ================================= */}

                      {isEditing ? (

                        <div className="grid gap-5 md:grid-cols-2">

                          <div className="space-y-2">

                            <Label>
                              Granted Quantity
                            </Label>

                            <Input
                              type="number"
                              value={
                                editSubscription.granted_quantity
                              }
                              onChange={(event) =>
                                setEditSubscription(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    granted_quantity:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                            />

                          </div>


                          <div className="space-y-2">

                            <Label>
                              Remaining Quantity
                            </Label>

                            <Input
                              type="number"
                              value={
                                editSubscription.remaining_quantity
                              }
                              onChange={(event) =>
                                setEditSubscription(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    remaining_quantity:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                            />

                          </div>


                          <div className="space-y-2">

                            <Label>
                              Start Date
                            </Label>

                            <Input
                              type="date"
                              value={
                                editSubscription.start_date
                              }
                              onChange={(event) =>
                                setEditSubscription(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    start_date:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                            />

                          </div>


                          <div className="space-y-2">

                            <Label>
                              Expiry Date
                            </Label>

                            <Input
                              type="date"
                              value={
                                editSubscription.expiry_date
                              }
                              onChange={(event) =>
                                setEditSubscription(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    expiry_date:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                            />

                          </div>

                        </div>

                      ) : (

                        /* =================================
                           VIEW MODE
                        ================================= */

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                          <InfoItem
                            label="Granted Quantity"
                            value={
                              subscription.granted_quantity ??
                              "-"
                            }
                          />

                          <InfoItem
                            label="Remaining Quantity"
                            value={
                              subscription.remaining_quantity ??
                              "-"
                            }
                          />

                          <InfoItem
                            icon={
                              <Calendar className="h-4 w-4" />
                            }
                            label="Start Date"
                            value={
                              formatDate(
                                subscription.start_date,
                              )
                            }
                          />

                          <InfoItem
                            icon={
                              <Clock className="h-4 w-4" />
                            }
                            label="Expiry Date"
                            value={
                              formatDate(
                                subscription.expiry_date,
                              )
                            }
                          />

                        </div>

                      )}

                    </div>
                  )
                },
              )}

            </div>

          )}

        </CardContent>

      </Card>


      {/* ===================================================
          REFRESHING
      =================================================== */}

      {loading && organization && (

        <div className="fixed bottom-5 right-5 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="h-4 w-4" />

            Refreshing organization...

          </div>

        </div>

      )}

    </div>
  )
}