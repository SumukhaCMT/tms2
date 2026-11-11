import { createElement, useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Landmark, Settings } from "lucide-react"
import api from "@/axios/axios"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useAuth } from "@/features/auth/useAuth"
import { setCartItems } from "@/features/subscription/cartSlice"
import { getCart } from "@/features/subscription/services/cartService"
import { getSidebarIcon } from "@/components/sidebar-icons"
import { getSidebarRoute } from "@/components/sidebar-routes"
import { hasPermission } from "@/permissions/permissions"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface SidebarSubModule {
  id: number
  code: string
  name: string
  expired?: boolean
}

interface SidebarModule {
  id: number
  code: string
  name: string
  subModules: SidebarSubModule[]
}

export function AppSidebar() {
  const [modules, setModules] = useState<SidebarModule[]>([])
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const hasCart = useAppSelector((state) => state.cart.items.length > 0)
  const dashboardIcon = getSidebarIcon("dashboard")
  const { pathname } = useLocation()
  const activeRoute = ["/dashboard", ...modules.flatMap((module) => module.subModules.map((subModule) => getSidebarRoute(subModule.code)))]
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0]

  useEffect(() => {
    let cancelled = false
    api
      .get("/v1/modules/sidebar")
      .then((res) => {
        if (!cancelled) setModules(res.data?.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setModules([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasPermission(user?.permissions?.plans ?? null, "READ")) return
    getCart()
      .then((rows) => dispatch(setCartItems(rows)))
      .catch(() => dispatch(setCartItems([])))
  }, [dispatch, user?.permissions?.plans])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Landmark className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TMS SOFTWARE</span>
                <span className="truncate text-xs text-muted-foreground">Temple Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Dashboard"
                  isActive={activeRoute === "/dashboard"}
                  render={<NavLink to="/dashboard" />}
                >
                  {createElement(dashboardIcon)}
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {modules.map((module) => (
          <SidebarGroup key={module.id}>
            <SidebarGroupLabel>{module.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {module.subModules.map((subModule) => (
                  <SidebarMenuItem key={subModule.id}>
                    <SidebarMenuButton
                      tooltip={subModule.name}
                      isActive={activeRoute === getSidebarRoute(subModule.code)}
                      render={<NavLink to={subModule.expired ? `/renew/${subModule.code}` : getSidebarRoute(subModule.code)} />}
                    >
                      {createElement(getSidebarIcon(subModule.code))}
                      <span className="flex items-start gap-0.5">
                        {subModule.name}
                        {subModule.code === "plans" && hasCart && (
                          <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-red-500" />
                        )}
                        {subModule.expired && (
                          <span className="ml-1 rounded bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive">Expired</span>
                        )}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" render={<NavLink to="/profile" />}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
