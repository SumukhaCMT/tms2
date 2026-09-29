import { createElement, useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Landmark, Settings } from "lucide-react"

import api from "@/axios/axios"
import { getSidebarIcon } from "@/components/sidebar-icons"
import { getSidebarRoute } from "@/components/sidebar-routes"
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
}

interface SidebarModule {
  id: number
  code: string
  name: string
  subModules: SidebarSubModule[]
}

export function AppSidebar() {
  const [modules, setModules] = useState<SidebarModule[]>([])
  const dashboardIcon = getSidebarIcon("dashboard")
  const { pathname } = useLocation()
  const activeRoute = ["/dashboard", ...modules.flatMap((module) => module.subModules.map((subModule) => getSidebarRoute(subModule.code)))]
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0]

  useEffect(() => {
    let cancelled = false
    api
      .get("/modules/sidebar")
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
                      render={<NavLink to={getSidebarRoute(subModule.code)} />}
                    >
                      {createElement(getSidebarIcon(subModule.code))}
                      <span>{subModule.name}</span>
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
            <SidebarMenuButton tooltip="Admin Name">
              <Settings />
              <span>Admin Name</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
