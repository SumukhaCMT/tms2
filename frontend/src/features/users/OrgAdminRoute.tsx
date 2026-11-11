import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/useAuth"

export default function OrgAdminRoute() {
  const { user } = useAuth()
  return user?.role_id === 2 ? <Outlet /> : <Navigate to="/dashboard" replace />
}
