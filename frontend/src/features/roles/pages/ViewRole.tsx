import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { Eye, Layers, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailMessage, DetailPage, DetailSection, DetailStats } from "@/components/ui/detail-page"

import { fetchRoleById } from "../roleThunks"
import { selectSelectedRole, selectRolesLoading } from "../roleSelectors"
import { fetchSubModules } from "../../sub_modules/submoduleThunks"
import { selectSubModules, selectSubModulesLoading } from "../../sub_modules/submoduleSelectors"

const PERMISSIONS = [
  { name: "View", bit: 0, icon: Eye },
  { name: "Add", bit: 4, icon: Plus },
  { name: "Edit", bit: 2, icon: Pencil },
  { name: "Delete", bit: 1, icon: Trash2 },
]

const allowed = (permission: number) => PERMISSIONS.filter((item) => item.bit === 0 || (permission & item.bit) !== 0)

export default function ViewRole() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const selected = useSelector(selectSelectedRole)
  const loading = useSelector(selectRolesLoading)
  const subModules = useSelector(selectSubModules)
  const subModulesLoading = useSelector(selectSubModulesLoading)
  const role = selected && String(selected.id) === id ? selected : null

  useEffect(() => {
    if (!id) return
    void dispatch(fetchRoleById(Number(id)))
    void dispatch(fetchSubModules({}))
  }, [dispatch, id])

  const subModuleName = (subModuleId: number) => subModules.find((item) => item.id === subModuleId)?.sub_module_name ?? `Submodule ${subModuleId}`
  const fullAccess = role?.permissions.filter((item) => item.permission === 7).length ?? 0

  return (
    <DetailPage
      title={role?.user_role_name ?? "Role Details"}
      description={role ? role.user_role || "Role details and permissions" : "Role details and permissions"}
      actions={
        role && (
          <Button render={<Link to={`/roles/edit/${role.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={(loading || subModulesLoading) && !role}
      empty={!role && "Role not found."}
    >
      {role && (
        <>
          <DetailStats
            items={[
              { label: "Submodules", value: role.permissions.length, icon: Layers },
              { label: "Full Access", value: fullAccess, icon: ShieldCheck },
            ]}
          />

          <DetailColumns
            aside={
              <DetailSection
                title="Role Information"
                fields={[
                  { label: "User Role Name", value: role.user_role_name },
                  { label: "User Role", value: role.user_role },
                ]}
              />
            }
          >
            <DetailSection
              title="Permissions"
              description="What this role can do in each submodule"
              action={<Badge variant="outline">{role.permissions.length} submodules</Badge>}
            >
              {role.permissions.length === 0 ? (
                <DetailMessage>No permissions assigned.</DetailMessage>
              ) : (
                <ResizableTable
                  columns={[
                    { id: "submodule", label: "Submodule", size: 12 },
                    { id: "permissions", label: "Permissions", size: 20 },
                  ]}
                >
                  <TableBody>
                    {role.permissions.map((permission) => (
                      <TableRow key={permission.sub_module_id}>
                        <TableCell className="font-medium">{subModuleName(permission.sub_module_id)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {allowed(permission.permission).map(({ name, icon: Icon }) => (
                              <Badge key={name} variant="secondary">
                                <Icon /> {name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ResizableTable>
              )}
            </DetailSection>
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
