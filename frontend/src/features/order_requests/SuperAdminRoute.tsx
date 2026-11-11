import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/useAuth"

export default function SuperAdminRoute() {
  const { user } = useAuth()
  return user?.is_internal ? <Outlet /> : <Navigate to="/dashboard" replace />
}
