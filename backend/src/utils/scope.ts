type ScopeUser = { organization_id: number | null; temple_id: number | null }

export const isOrgScope = (user: ScopeUser) => !user.temple_id && !!user.organization_id

export const ORG_ADMIN_ROLE_ID = 2

export const canViewCreator = (roleId: number) => roleId === 1 || roleId === 2 || roleId === 3

export const hideCreator = <T extends { created_by_name?: string | null }>(rows: T[], roleId: number): T[] =>
  canViewCreator(roleId) ? rows : rows.map((row) => ({ ...row, created_by_name: null }))

export const isInScope = (user: ScopeUser, organizationId: number, templeId: number, creatorRoleId?: number) => {
  if (user.temple_id) return templeId === user.temple_id && Number(creatorRoleId) !== ORG_ADMIN_ROLE_ID
  if (user.organization_id) return organizationId === user.organization_id
  return true
}

export const resolveAssignment = (roleId: number, isInternal: boolean, organizationId: number | null, templeId: number | null) => {
  if (isInternal) return { organization_id: null, temple_id: null }
  if (roleId === ORG_ADMIN_ROLE_ID) return organizationId ? { organization_id: organizationId, temple_id: null } : null
  return organizationId && templeId ? { organization_id: organizationId, temple_id: templeId } : null
}

export const hasValidRoleScope = (roleId: number, isInternal: boolean, organizationId: number | null, templeId: number | null) => {
  if (isInternal) return !organizationId && !templeId
  if (roleId === ORG_ADMIN_ROLE_ID) return !!organizationId && !templeId
  return !!organizationId && !!templeId
}

export const scopeClaims = (isInternal: boolean, scope: ScopeUser) =>
  isInternal ? {} : { organization_id: scope.organization_id, temple_id: scope.temple_id }

export const listTempleId = (user: ScopeUser, requested: unknown) => user.temple_id || Number(requested) || null
