import { useState, useEffect } from 'react'
import { useAuth } from "@/features/auth/useAuth"
import SuperAdminDashboard from "@/features/dashboards/pages/SuperAdminDashboard"
import OrgAdminDashboard from "@/features/dashboards/pages/OrgAdminDashboard"
import TempleAdminDashboard from "@/features/dashboards/pages/TempleAdminDashboard"
import UserDashboard from "@/features/dashboards/pages/UserDashboard"
import DashboardSkeleton from "@/features/dashboards/components/DashboardSkeleton"

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) return null
  if (user.role_id === 1) return <SuperAdminDashboard />
  if (user.role_id === 2) return <OrgAdminDashboard />
  if (user.role_id === 3) return <TempleAdminDashboard templeId={user.temple_id ?? 0} name={user.name} />
  return <UserDashboard userId={user.id} name={user.name} />
}
