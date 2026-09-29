import { useAuth } from "../features/auth/useAuth"
import {
    hasPermission,
    type PermissionAction,
} from "../../../backend/src/permissions/permissions"

export function usePermission(
    module: string,
    action: PermissionAction
): boolean {
    const { user } = useAuth()
    const permission = user?.permissions?.[module] ?? null

    return hasPermission(permission, action)
}