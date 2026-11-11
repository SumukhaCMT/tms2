




// import type { ReactNode } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Outlet, useLocation } from "react-router-dom"
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb"

// interface LayoutProps {
//   children: ReactNode
// }

// export default function Layout({ children }: LayoutProps) {
 export default function Layout() {
  const { pathname } = useLocation()

  return (
    <SidebarProvider>

      {/* SIDEBAR */}
      <AppSidebar />

      {/* MAIN */}
      <SidebarInset>

        {/* HEADER */}
        <Header />

        {/* PAGE */}
        <div className="group/page flex-1 bg-muted/30 p-6 md:p-8">
          {/* {children} */}
          {pathname !== "/dashboard" && (
            <div className="mb-4 group-has-[[data-list-header]]/page:hidden">
              <PageBreadcrumb />
            </div>
          )}
           <Outlet />
           
        </div>

        {/* FOOTER */}
        <Footer />

      </SidebarInset>

    </SidebarProvider>
  )
}

