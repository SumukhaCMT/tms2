
import type { PoolConnection } from "mysql2/promise";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"
  | "EXPORT"
  | "FAILED_LOGIN";

export interface AuditLogInput {
  userId?: number | null;
  organizationId?: number | null;
  templeId?: number | null;
  action: AuditAction;
  module: string;
  tableName?: string | null;
  recordId?: string | number | null;
  endpoint?: string | null;
  description?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const ACTION_MAP: Record<AuditAction, string> = {
  CREATE: "insert",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  VIEW: "select",
  EXPORT: "export",
  FAILED_LOGIN: "failed_login",
};

export async function createAuditLog(
  connection: PoolConnection,
  data: AuditLogInput,
): Promise<void> {
  const sql = `
    INSERT INTO audit_logs (
      user_id,
      organization_id,
      temple_id,
      module,
      table_name,
      action,
      record_id,
      endpoint,
      old_data,
      new_data,
      ip_address,
      user_agent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
  `;

  const oldData =
    data.oldValues == null
      ? null
      : JSON.stringify(data.oldValues);

  const newData =
    data.newValues == null && !data.description
      ? null
      : JSON.stringify({
          ...(data.newValues != null &&
          typeof data.newValues === "object" &&
          !Array.isArray(data.newValues)
            ? data.newValues as Record<string, unknown>
            : data.newValues == null
              ? {}
              : { value: data.newValues }),
          ...(data.description
            ? { _description: data.description }
            : {}),
        });

  await connection.execute(sql, [
    data.userId ?? null,
    data.organizationId ?? null,
    data.templeId ?? null,
    data.module,
    data.tableName ?? null,
    ACTION_MAP[data.action],
    data.recordId == null ? null : String(data.recordId),
    data.endpoint ?? null,
    oldData,
    newData,
    data.ipAddress ?? null,
    data.userAgent ?? null,
  ]);
}
