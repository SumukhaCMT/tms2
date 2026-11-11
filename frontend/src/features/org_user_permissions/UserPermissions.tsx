import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "@/axios/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { useAuth } from "@/features/auth/useAuth"
import { PermissionCheckbox, SubmoduleMultiSelect, type SubModule } from "@/features/roles/components/RoleForm"
import type { UserApiRow } from "@/features/users/usersTypes"
import { calculatePermission, getPermission, hasPermission, type PermissionType, type RolePermission } from "@/features/roles/permissionMatrix"

type GrantableSubModule = SubModule & { sub_module_code: string }

const ACTIONS: PermissionType[] = ["view", "add", "edit", "delete"]

export default function UserPermissions() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [users, setUsers] = useState<UserApiRow[]>([])
  const [userId, setUserId] = useState("")
  const [subModules, setSubModules] = useState<GrantableSubModule[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [noViewIds, setNoViewIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get("/v1/org-users")
      .then((res) => {
        const rows: UserApiRow[] = res.data?.data ?? []
        setUsers(rows)
        setUserId(rows[0] ? String(rows[0].id) : "")
        setLoading(rows.length > 0)
      })
      .catch(() => showCmtToast("expiry", "Failed to load users. Please try again."))
  }, [])

  useEffect(() => {
    if (!userId) return
    api
      .get(`/v1/org-user-permissions/${userId}`)
      .then((res) => {
        const rows: RolePermission[] = res.data?.data?.permissions ?? []
        setSubModules(res.data?.data?.sub_modules ?? [])
        setPermissions(rows)
        setNoViewIds([])
        setSelectedIds(rows.map((row) => row.sub_module_id))
      })
      .catch(() => showCmtToast("expiry", "Failed to load permissions. Please try again."))
      .finally(() => setLoading(false))
  }, [userId])

  const disabled = loading || saving

  const selectedSubModules = subModules.filter((subModule) => selectedIds.includes(subModule.id))

  const canGrant = (subModule: GrantableSubModule, action: PermissionType) =>
    hasPermission(user?.permissions?.[subModule.sub_module_code] ?? 0, action)

  function handleUserChange(value: string) {
    if (value === userId) return
    setLoading(true)
    setUserId(value)
  }

  const userLabel = (value: string) => {
    const match = users.find((item) => String(item.id) === value)
    return match ? `${match.user_name} · ${match.user_role.replace(/_/g, " ")}${match.temp_name ? ` · ${match.temp_name}` : ""}` : "Select user"
  }

  const hasView = (subModuleId: number) => !noViewIds.includes(subModuleId)

  const setPermission = (subModuleId: number, permission: number) =>
    setPermissions((current) => [...current.filter((item) => item.sub_module_id !== subModuleId), { sub_module_id: subModuleId, permission }])

  function togglePermission(subModuleId: number, action: PermissionType) {
    if (action === "view" && hasView(subModuleId)) {
      setNoViewIds((current) => [...current, subModuleId])
      setPermission(subModuleId, 0)
      return
    }
    setNoViewIds((current) => current.filter((id) => id !== subModuleId))
    if (action !== "view") setPermission(subModuleId, calculatePermission(getPermission(permissions, subModuleId), action))
  }

  function handleSave() {
    setSaving(true)
    api
      .put(`/v1/org-user-permissions/${userId}`, {
        permissions: selectedIds.filter(hasView).map((id) => ({ sub_module_id: id, permission: getPermission(permissions, id) })),
      })
      .then((res) => showCmtToast("success", res.data?.message ?? "Permissions updated successfully"))
      .catch((error) => showCmtToast("expiry", error.response?.data?.message ?? "Failed to update permissions."))
      .finally(() => setSaving(false))
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>User</FieldLabel>
              <Select value={userId} onValueChange={(value) => handleUserChange(String(value))} disabled={saving}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue>{userLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {users.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)} className="capitalize">
                      {userLabel(String(item.id))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Select the temple admin or user to configure.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Submodules</FieldLabel>
              <SubmoduleMultiSelect subModules={subModules} value={selectedIds} onChange={setSelectedIds} disabled={disabled} />
              <FieldDescription>Select the submodules this user can access.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Permissions</FieldLabel>
              <FieldDescription>Configure permissions for each selected submodule.</FieldDescription>

              {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Loading permissions...</div>
              ) : selectedSubModules.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Select at least one submodule to configure permissions.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Submodule</th>
                        {ACTIONS.map((action) => (
                          <th key={action} className="px-4 py-3 text-center font-medium capitalize">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubModules.map((subModule) => {
                        const permission = getPermission(permissions, subModule.id)
                        return (
                          <tr key={subModule.id} className="border-b last:border-b-0">
                            <td className="px-4 py-3">
                              <div className="font-medium">{subModule.sub_module_name}</div>
                              <div className="text-xs text-muted-foreground">{subModule.sub_module_code}</div>
                            </td>
                            {ACTIONS.map((action) => (
                              <td key={action} className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  <PermissionCheckbox
                                    checked={hasView(subModule.id) && hasPermission(permission, action)}
                                    disabled={saving || !canGrant(subModule, action)}
                                    onChange={() => togglePermission(subModule.id, action)}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={saving} onClick={() => navigate("/users")}>
            Cancel
          </Button>
          <Button type="button" disabled={disabled || !userId} onClick={handleSave}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
