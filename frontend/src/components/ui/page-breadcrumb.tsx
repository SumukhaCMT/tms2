import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const LABELS: Record<string, string> = {
  "org-users": "Users",
  "org-user-permissions": "User Permissions",
  diaties: "Deities",
  submodule: "Sub Modules",
  subscriptionplans: "Subscription Plans",
  subscriptionbundles: "Subscription Bundles",
  pricing: "Plans",
  define: "Define Hundi",
  "manual-order": "Manual Orders",
}

const ACTIONS = new Set(["add", "edit", "view"])

const toLabel = (segment: string) =>
  LABELS[segment] ?? segment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

export function PageBreadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)
  const actionIndex = segments.findIndex((segment) => ACTIONS.has(segment))
  const visible = actionIndex === -1 ? segments : segments.slice(0, actionIndex + 1)

  const crumbs = visible.map((segment, index) => ({
    label: toLabel(segment),
    to: `/${visible.slice(0, index + 1).join("/")}`,
    linkable: index < visible.length - 1 && !ACTIONS.has(segment),
  }))

  const items = pathname === "/dashboard" ? crumbs : [{ label: "Home", to: "/dashboard", linkable: true }, ...crumbs]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.to}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.linkable ? (
                <BreadcrumbLink render={<Link to={item.to} />}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
