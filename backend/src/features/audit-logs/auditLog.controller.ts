
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  AUDIT_ACTIONS,
} from "./auditLog.types";

import { getAuditLogs } from "./auditLog.service";

// Correct path: src/config/database.ts
import pool from "../../config/database";

const isPositiveInteger = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    /^\d+$/.test(value) &&
    Number(value) > 0
  );
};

export const listAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Use the existing Express authentication type.
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const pageValue = req.query.page ?? "1";
    const limitValue = req.query.limit ?? "10";

    if (
      !isPositiveInteger(pageValue) ||
      !isPositiveInteger(limitValue)
    ) {
      res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
      return;
    }

    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (limit > 100 || page > 1_000_000) {
      res.status(400).json({
        success: false,
        message: "Pagination values are outside the allowed range",
      });
      return;
    }

    const action = req.query.action;
    const module = req.query.module;
    const userId = req.query.userId;
    const from = req.query.from;
    const to = req.query.to;

    if (
      action !== undefined &&
      (
        typeof action !== "string" ||
        !AUDIT_ACTIONS.includes(
          action as (typeof AUDIT_ACTIONS)[number],
        )
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid audit action",
      });
      return;
    }

    if (
      module !== undefined &&
      (
        typeof module !== "string" ||
        module.length > 100
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid module filter",
      });
      return;
    }

    if (
      userId !== undefined &&
      !isPositiveInteger(userId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const validDate = (value: unknown): value is string => {
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return false;
      }

      const date = new Date(`${value}T00:00:00Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().startsWith(value)
      );
    };

    if (
      (from !== undefined && !validDate(from)) ||
      (to !== undefined && !validDate(to)) ||
      (
        typeof from === "string" &&
        typeof to === "string" &&
        from > to
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid date range; use YYYY-MM-DD",
      });
      return;
    }

    const isSuperAdmin = user.user_type === "super_admin";

    const organizationId = isSuperAdmin
      ? null
      : user.organization_id ?? null;

    const templeId = isSuperAdmin
      ? null
      : user.temple_id ?? null;

    if (!isSuperAdmin && organizationId == null) {
      res.status(403).json({
        success: false,
        message: "Organization access is required",
      });
      return;
    }

    const result = await getAuditLogs(pool, {
      page,
      limit,
      action: action as
        | (typeof AUDIT_ACTIONS)[number]
        | undefined,
      module: module as string | undefined,
      userId: userId ? Number(userId) : undefined,
      from: from as string | undefined,
      to: to as string | undefined,
      organizationId,
      templeId,
    });

    res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
