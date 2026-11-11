

export const PERMISSIONS = {
    DELETE: 1,
    EDIT: 2,
    ADD: 4,
} as const

const MAX_PERMISSION_VALUE =
    PERMISSIONS.DELETE |
    PERMISSIONS.EDIT |
    PERMISSIONS.ADD

export type PermissionAction =
    keyof typeof PERMISSIONS | "READ"

export function hasPermission(
    permission: number | null,
    action: PermissionAction
): boolean {
    if (
        permission === null ||
        permission < 0 ||
        permission > MAX_PERMISSION_VALUE
    ) {
        return false
    }

    if (action === "READ") {
        return true
    }

    return (
        (permission & PERMISSIONS[action]) ===
        PERMISSIONS[action]
    )
}