import { useAuth } from "@/features/auth/useAuth"

export function useCanViewCreator() {
  const { user } = useAuth()
  return user?.role_id === 1 || user?.role_id === 2 || user?.role_id === 3
}
