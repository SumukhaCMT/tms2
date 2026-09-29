

"use client"

import { useEffect } from "react"

import {
  NavLink,
  useParams,
} from "react-router-dom"

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
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  //Pencil,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  User,
  Users,
} from "lucide-react"

import type { AppDispatch } from "@/app/store"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Badge,
} from "@/components/ui/badge"

import {
  Button,
} from "@/components/ui/button"

import {
  fetchOrganizationById,
} from "../organizationThunks"

import {
  selectSelectedOrganization,
  selectOrganizationDetailsLoading,
  selectOrganizationError,
} from "../organizationSelectors"

/* =========================================================
   PAGE
========================================================= */

export default function ViewOrganizations() {
  const { id } = useParams<{
    id: string
  }>()

  const dispatch =
    useDispatch<AppDispatch>()

  const data =
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

  /* =========================================================
     FETCH
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return
    }

    dispatch(
      fetchOrganizationById(id),
    )
  }, [dispatch, id])

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading organization...
        </div>
      </div>
    )
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <Building2 className="size-6 text-destructive" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">
            Failed to load organization
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </div>

        <Button
          variant="outline"
        
        >
          <NavLink to="/organizations">
            Back to Organizations
          </NavLink>
        </Button>
      </div>
    )
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!data?.organization) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-6 text-muted-foreground" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">
            Organization not found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The requested organization could not be found.
          </p>
        </div>

        <Button
          variant="outline"
         
        >
          <NavLink to="/organizations">
            Back to Organizations
          </NavLink>
        </Button>
      </div>
    )
  }

  const {
    organization,
    temples = [],
    users = [],
    subscriptions = [],
    orders = [],
  } = data

  const isActive =
    organization.org_status === "active"

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="w-full space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm text-muted-foreground">
            Organizations
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Organization Details
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Complete organization information
          </p>
        </div>

        {/* <Button
          variant="outline"
          
        >
          <NavLink
            to={`/organizations/edit/${organization.id}`}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </NavLink>
        </Button> */}
         <Button
          variant="outline"
          
        >
          <NavLink
            to={`/organizations/`}
          >
            {/* <Pencil className="mr-2 size-4" /> */}
           Back
          </NavLink>
        </Button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <SummaryCard
          icon={<Building2 />}
          label="Temples"
          value={temples.length}
        />

        <SummaryCard
          icon={<Users />}
          label="Users"
          value={users.length}
        />

        <SummaryCard
          icon={<Receipt />}
          label="Subscriptions"
          value={subscriptions.length}
        />

        <SummaryCard
          icon={<ShoppingCart />}
          label="Orders"
          value={orders.length}
        />

      </div>

      {/* =====================================================
          ORGANIZATION PROFILE
      ===================================================== */}

      <Card>

        <CardContent className="p-6">

          <div className="flex flex-col gap-6 lg:flex-row">

            {/* LOGO */}

            <div className="flex shrink-0">

              <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border bg-muted">

                {organization.org_img_name ? (
                  <img
                    src={organization.org_img_name}
                    alt={organization.org_name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-12 text-muted-foreground" />
                )}

              </div>

            </div>

            {/* DETAILS */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-semibold">
                      {organization.org_name}
                    </h2>

                    <Badge
                      variant={
                        isActive
                          ? "default"
                          : "destructive"
                      }
                    >
                      {organization.org_status}
                    </Badge>

                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Organization ID:{" "}
                    {organization.id}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Slug:{" "}
                    {organization.org_slug}
                  </p>

                </div>

              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                <InfoItem
                  icon={<Mail />}
                  label="Email"
                  value={
                    organization.org_email
                  }
                />

                <InfoItem
                  icon={<Phone />}
                  label="Phone"
                  value={
                    organization.org_phone
                  }
                />

                <InfoItem
                  icon={<Clock />}
                  label="Timezone"
                  value={
                    organization.org_timezone
                  }
                />

              </div>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          LEGAL INFORMATION
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Legal Information
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<Building2 />}
              label="Legal Name"
              value={
                organization.org_legal_name
              }
            />

            <InfoItem
              icon={<FileText />}
              label="Registration Number"
              value={
                organization.org_registration_number
              }
            />

            <InfoItem
              icon={<ShieldCheck />}
              label="GST Number"
              value={
                organization.org_gst_number
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Phone className="size-5" />
            Contact Information
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<Mail />}
              label="Email"
              value={
                organization.org_email
              }
            />

            <InfoItem
              icon={<Phone />}
              label="Phone"
              value={
                organization.org_phone
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Address Information
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<MapPin />}
              label="Address Line 1"
              value={
                organization.org_address_line1
              }
            />

            <InfoItem
              icon={<MapPin />}
              label="Address Line 2"
              value={
                organization.org_address_line2
              }
            />

            <InfoItem
              icon={<MapPin />}
              label="City"
              value={
                organization.org_city
              }
            />

            <InfoItem
              icon={<MapPin />}
              label="State"
              value={
                organization.org_state
              }
            />

            <InfoItem
              icon={<Globe />}
              label="Country"
              value={
                organization.org_country
              }
            />

            <InfoItem
              icon={<MapPin />}
              label="Pincode"
              value={
                organization.org_pincode
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          TEMPLES
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Temples
            <Badge variant="secondary">
              {temples.length}
            </Badge>
          </CardTitle>

        </CardHeader>

        <CardContent>

          {temples.length === 0 ? (
            <EmptyState
              icon={<Building2 />}
              message="No temples found for this organization."
            />
          ) : (
            <div className="space-y-4">

              {temples.map((temple) => (

                <div
                  key={temple.id}
                  className="rounded-lg border p-4"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold">
                          {temple.temp_name}
                        </h3>

                        {temple.temp_is_primary === 1 && (
                          <Badge variant="default">
                            Primary
                          </Badge>
                        )}

                        <Badge variant="outline">
                          {temple.temp_status}
                        </Badge>

                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Temple ID: {temple.id}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <InfoItem
                      icon={<Mail />}
                      label="Email"
                      value={temple.temp_email}
                    />

                    <InfoItem
                      icon={<Phone />}
                      label="Phone"
                      value={temple.temp_phone}
                    />

                    <InfoItem
                      icon={<MapPin />}
                      label="City"
                      value={temple.temp_city}
                    />

                    <InfoItem
                      icon={<MapPin />}
                      label="State"
                      value={temple.temp_state}
                    />

                    <InfoItem
                      icon={<Globe />}
                      label="Country"
                      value={temple.temp_country}
                    />

                    <InfoItem
                      icon={<MapPin />}
                      label="Pincode"
                      value={temple.temp_pincode}
                    />

                  </div>

                </div>

              ))}

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          USERS
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Users
            <Badge variant="secondary">
              {users.length}
            </Badge>
          </CardTitle>

        </CardHeader>

        <CardContent>

          {users.length === 0 ? (
            <EmptyState
              icon={<Users />}
              message="No users found for this organization."
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b text-left">

                    <th className="px-3 py-3 font-medium">
                      ID
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Code
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Name
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Email
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Phone
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Role ID
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-3 py-3">
                        {user.id}
                      </td>

                      <td className="px-3 py-3 font-medium">
                        {user.user_code}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          {user.user_name}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {user.user_email || "Not Available"}
                      </td>

                      <td className="px-3 py-3">
                        {user.user_phone || "Not Available"}
                      </td>

                      <td className="px-3 py-3">
                        {user.role_id}
                      </td>

                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            user.user_status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {user.user_status}
                        </Badge>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          SUBSCRIPTIONS
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="size-5" />
            Subscriptions
            <Badge variant="secondary">
              {subscriptions.length}
            </Badge>
          </CardTitle>

        </CardHeader>

        <CardContent>

          {subscriptions.length === 0 ? (
            <EmptyState
              icon={<BadgeCheck />}
              message="No subscriptions found."
            />
          ) : (
            <div className="space-y-4">

              {subscriptions.map(
                (subscription) => (

                  <div
                    key={subscription.id}
                    className="rounded-lg border p-4"
                  >

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold">
                            {subscription.subscription_type === "plan"
                              ? "Plan Subscription"
                              : "Bundle Subscription"}
                          </h3>

                          <Badge variant="outline">
                            {subscription.license_type}
                          </Badge>

                          <Badge
                            variant={
                              subscription.subscription_status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {subscription.subscription_status}
                          </Badge>

                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Subscription ID:{" "}
                          {subscription.id}
                        </p>

                      </div>

                      <div className="text-sm font-medium">
                        {subscription.is_free_trial === 1
                          ? "Free Trial"
                          : "Paid Subscription"}
                      </div>

                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      <InfoItem
                        icon={<FileText />}
                        label="Plan ID"
                        value={
                          subscription.plan_id
                            ? String(
                                subscription.plan_id,
                              )
                            : null
                        }
                      />

                      <InfoItem
                        icon={<FileText />}
                        label="Bundle ID"
                        value={
                          subscription.bundle_id
                            ? String(
                                subscription.bundle_id,
                              )
                            : null
                        }
                      />

                      <InfoItem
                        icon={<CheckCircle2 />}
                        label="Granted Quantity"
                        value={String(
                          subscription.granted_quantity,
                        )}
                      />

                      <InfoItem
                        icon={<Clock />}
                        label="Remaining Quantity"
                        value={String(
                          subscription.remaining_quantity,
                        )}
                      />

                      <InfoItem
                        icon={<Calendar />}
                        label="Start Date"
                        value={formatDate(
                          subscription.start_date,
                        )}
                      />

                      <InfoItem
                        icon={<Calendar />}
                        label="Expiry Date"
                        value={
                          subscription.expiry_date
                            ? formatDate(
                                subscription.expiry_date,
                              )
                            : "No Expiry"
                        }
                      />

                    </div>

                  </div>

                ),
              )}

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Orders
            <Badge variant="secondary">
              {orders.length}
            </Badge>
          </CardTitle>

        </CardHeader>

        <CardContent>

          {orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart />}
              message="No orders found."
            />
          ) : (
            <div className="space-y-6">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-xl border"
                >

                  {/* ORDER HEADER */}

                  <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold">
                          {order.order_number}
                        </h3>

                        <Badge variant="outline">
                          {order.payment_method}
                        </Badge>

                        <Badge
                          variant={
                            order.payment_status === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.payment_status}
                        </Badge>

                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Order ID: {order.id}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Placed by:{" "}
                        {order.placed_by_name}
                      </p>

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-xs text-muted-foreground">
                        Grand Total
                      </p>

                      <p className="text-xl font-semibold">
                        {formatCurrency(
                          order.grand_total,
                          order.currency,
                        )}
                      </p>

                    </div>

                  </div>

                  {/* PAYMENT */}

                  <div className="border-b p-5">

                    <h4 className="mb-4 flex items-center gap-2 font-medium">
                      <CreditCard className="size-4" />
                      Payment Information
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      <InfoItem
                        icon={<CreditCard />}
                        label="Payment Method"
                        value={
                          order.payment_method
                        }
                      />

                      <InfoItem
                        icon={<FileText />}
                        label="Payment Mode"
                        value={
                          order.manual_payment_mode
                        }
                      />

                      <InfoItem
                        icon={<Receipt />}
                        label="Reference"
                        value={
                          order.manual_payment_reference
                        }
                      />

                      <InfoItem
                        icon={<Calendar />}
                        label="Payment Date"
                        value={
                          order.manual_payment_date
                            ? formatDate(
                                order.manual_payment_date,
                              )
                            : null
                        }
                      />

                    </div>

                  </div>

                  {/* ORDER TOTAL */}

                  <div className="border-b p-5">

                    <h4 className="mb-4 flex items-center gap-2 font-medium">
                      <Receipt className="size-4" />
                      Order Summary
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-3">

                      <InfoItem
                        icon={<Receipt />}
                        label="Subtotal"
                        value={formatCurrency(
                          order.subtotal,
                          order.currency,
                        )}
                      />

                      <InfoItem
                        icon={<Receipt />}
                        label="GST"
                        value={formatCurrency(
                          order.total_gst_amount,
                          order.currency,
                        )}
                      />

                      <InfoItem
                        icon={<Receipt />}
                        label="Grand Total"
                        value={formatCurrency(
                          order.grand_total,
                          order.currency,
                        )}
                      />

                    </div>

                  </div>

                  {/* BILLING */}

                  <div className="border-b p-5">

                    <h4 className="mb-4 flex items-center gap-2 font-medium">
                      <FileText className="size-4" />
                      Billing Information
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      <InfoItem
                        icon={<Building2 />}
                        label="Billing Name"
                        value={
                          order.billing_name
                        }
                      />

                      <InfoItem
                        icon={<ShieldCheck />}
                        label="GST Number"
                        value={
                          order.billing_gst_number
                        }
                      />

                      <InfoItem
                        icon={<Mail />}
                        label="Email"
                        value={
                          order.billing_email
                        }
                      />

                      <InfoItem
                        icon={<Phone />}
                        label="Phone"
                        value={
                          order.billing_phone
                        }
                      />

                      <InfoItem
                        icon={<MapPin />}
                        label="City"
                        value={
                          order.billing_city
                        }
                      />

                      <InfoItem
                        icon={<MapPin />}
                        label="State"
                        value={
                          order.billing_state
                        }
                      />

                      <InfoItem
                        icon={<Globe />}
                        label="Country"
                        value={
                          order.billing_country
                        }
                      />

                      <InfoItem
                        icon={<MapPin />}
                        label="Pincode"
                        value={
                          order.billing_pincode
                        }
                      />

                    </div>

                    {(
                      order.billing_address_line1 ||
                      order.billing_address_line2
                    ) && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">

                        <InfoItem
                          icon={<MapPin />}
                          label="Address Line 1"
                          value={
                            order.billing_address_line1
                          }
                        />

                        <InfoItem
                          icon={<MapPin />}
                          label="Address Line 2"
                          value={
                            order.billing_address_line2
                          }
                        />

                      </div>
                    )}

                  </div>

                  {/* ORDER ITEMS */}

                  <div className="p-5">

                    <h4 className="mb-4 flex items-center gap-2 font-medium">
                      <ShoppingCart className="size-4" />
                      Order Items
                      <Badge variant="secondary">
                        {order.items.length}
                      </Badge>
                    </h4>

                    {order.items.length === 0 ? (
                      <EmptyState
                        icon={<ShoppingCart />}
                        message="No items found for this order."
                      />
                    ) : (
                      <div className="space-y-3">

                        {order.items.map(
                          (item) => (

                            <div
                              key={item.id}
                              className="rounded-lg border p-4"
                            >

                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                                <div>

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h5 className="font-medium">
                                      {item.item_name}
                                    </h5>

                                    <Badge variant="outline">
                                      {item.item_type}
                                    </Badge>

                                    <Badge variant="outline">
                                      {item.item_code}
                                    </Badge>

                                  </div>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Item ID: {item.id}
                                  </p>

                                </div>

                                <div className="text-left md:text-right">

                                  <p className="text-xs text-muted-foreground">
                                    Line Total
                                  </p>

                                  <p className="font-semibold">
                                    {formatCurrency(
                                      item.line_total,
                                      order.currency,
                                    )}
                                  </p>

                                </div>

                              </div>

                              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                                <InfoItem
                                  icon={<FileText />}
                                  label="Plan ID"
                                  value={
                                    item.plan_id
                                      ? String(
                                          item.plan_id,
                                        )
                                      : null
                                  }
                                />

                                <InfoItem
                                  icon={<FileText />}
                                  label="Bundle ID"
                                  value={
                                    item.bundle_id
                                      ? String(
                                          item.bundle_id,
                                        )
                                      : null
                                  }
                                />

                                <InfoItem
                                  icon={<Users />}
                                  label="Quantity"
                                  value={String(
                                    item.quantity,
                                  )}
                                />

                                <InfoItem
                                  icon={<Receipt />}
                                  label="Unit Price"
                                  value={formatCurrency(
                                    item.unit_price,
                                    order.currency,
                                  )}
                                />

                                <InfoItem
                                  icon={<Receipt />}
                                  label="GST"
                                  value={`${item.gst_percentage}%`}
                                />

                                <InfoItem
                                  icon={<Calendar />}
                                  label="Start Date"
                                  value={
                                    item.start_date
                                      ? formatDate(
                                          item.start_date,
                                        )
                                      : null
                                  }
                                />

                                <InfoItem
                                  icon={<Calendar />}
                                  label="End Date"
                                  value={
                                    item.end_date
                                      ? formatDate(
                                          item.end_date,
                                        )
                                      : "No Expiry"
                                  }
                                />

                                <InfoItem
                                  icon={<BadgeCheck />}
                                  label="License"
                                  value={
                                    item.license_type
                                  }
                                />

                                <InfoItem
                                  icon={<Receipt />}
                                  label="GST Amount"
                                  value={formatCurrency(
                                    item.gst_amount,
                                    order.currency,
                                  )}
                                />

                                <InfoItem
                                  icon={<Receipt />}
                                  label="Subscription ID"
                                  value={
                                    item.org_subscription_id
                                      ? String(
                                          item.org_subscription_id,
                                        )
                                      : null
                                  }
                                />

                              </div>

                            </div>

                          ),
                        )}

                      </div>
                    )}

                  </div>

                </div>

              ))}

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          ORGANIZATION STATUS
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Organization Status
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<ShieldCheck />}
              label="Status"
              value={
                organization.org_status
              }
            />

            <InfoItem
              icon={<Clock />}
              label="Timezone"
              value={
                organization.org_timezone
              }
            />

            <InfoItem
              icon={<Globe />}
              label="Country"
              value={
                organization.org_country
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          SYSTEM INFORMATION
      ===================================================== */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            System Information
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<FileText />}
              label="Organization ID"
              value={String(
                organization.id,
              )}
            />

            <InfoItem
              icon={<FileText />}
              label="Organization Slug"
              value={
                organization.org_slug
              }
            />

            <InfoItem
              icon={<Calendar />}
              label="Created At"
              value={formatDate(
                organization.created_at,
              )}
            />

            <InfoItem
              icon={<Calendar />}
              label="Updated At"
              value={formatDate(
                organization.updated_at,
              )}
            />

            <InfoItem
              icon={<Calendar />}
              label="Deleted At"
              value={
                organization.deleted_at
                  ? formatDate(
                      organization.deleted_at,
                    )
                  : "Not Deleted"
              }
            />

          </div>

        </CardContent>

      </Card>

    </div>
  )
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>

      <CardContent className="flex items-center gap-4 p-5">

        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>

        <div>

          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-semibold">
            {value}
          </p>

        </div>

      </CardContent>

    </Card>
  )
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode
  message: string
}) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">

      <div className="text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>

      <p className="text-sm text-muted-foreground">
        {message}
      </p>

    </div>
  )
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="flex gap-3">

      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">

        {icon}

      </div>

      <div className="min-w-0">

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value || "Not Available"}
        </p>

      </div>

    </div>
  )
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "Not Available"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not Available"
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  )
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
  value?: string | number | null,
  currency = "INR",
) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return "Not Available"
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(amount)
}