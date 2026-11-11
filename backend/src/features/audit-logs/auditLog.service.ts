import type { RowDataPacket } from "mysql2/promise";
import type { Pool } from "mysql2/promise";

import type {
  AuditAction,
} from "./auditLog.types";

export interface AuditLogFilters {
  page: number;
  limit: number;
  action?: AuditAction;
  module?: string;
  userId?: number;
  from?: string;
  to?: string;
  organizationId?: number | null;
  templeId?: number | null;
}

interface AuditLogRow extends RowDataPacket {
  id: number;
  user_id: number | null;
  organization_id: number | null;
  temple_id: number | null;
  action: AuditAction;
  module: string;
  record_id: string | null;
  description: string | null;
  old_values: unknown;
  new_values: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export const getAuditLogs = async (
  pool: Pool,
  filters: AuditLogFilters,
) => {
  const where: string[] = [];
  const params: Array<string | number> = [];

  // Restrict results to the caller's authorized tenant scope.
  if (filters.organizationId != null) {
    where.push("organization_id = ?");
    params.push(filters.organizationId);
  }

  if (filters.templeId != null) {
    where.push("temple_id = ?");
    params.push(filters.templeId);
  }

  if (filters.action) {
    where.push("action = ?");
    params.push(filters.action);
  }

  if (filters.module) {
    where.push("module = ?");
    params.push(filters.module);
  }

  if (filters.userId != null) {
    where.push("user_id = ?");
    params.push(filters.userId);
  }

  if (filters.from) {
    where.push("created_at >= ?");
    params.push(`${filters.from} 00:00:00`);
  }

  if (filters.to) {
    where.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(`${filters.to} 00:00:00`);
  }

  const whereSql = where.length
    ? `WHERE ${where.join(" AND ")}`
    : "";

  const offset = (filters.page - 1) * filters.limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.execute<AuditLogRow[]>(
    `
      SELECT
        id,
        user_id,
        organization_id,
        temple_id,
        action,
        module,
        record_id,
        description,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at
      FROM audit_logs
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, filters.limit, offset],
  );

  return {
    data: rows,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};