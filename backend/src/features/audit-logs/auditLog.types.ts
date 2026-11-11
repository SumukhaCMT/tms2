
export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "VIEW",
  "EXPORT",
] as const;

export type AuditAction =
  (typeof AUDIT_ACTIONS)[number];

export interface AuditLogInput {
  userId?: number | null;
  organizationId?: number | null;
  templeId?: number | null;

  action: AuditAction;
  module: string;
  recordId?: string | number | null;
  description?: string | null;

  oldValues?: unknown;
  newValues?: unknown;

  ipAddress?: string | null;
  userAgent?: string | null;
}
