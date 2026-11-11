import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import crypto from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { hasPermission, PermissionAction } from '../permissions/permissions';
import { resolveAssignment } from '../utils/scope';
import { resolvePermissions } from '../features/auth/services/auth.service';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            String(process.env.JWT_SECRET)
        ) as JwtPayload & {
            id: number;
            sid: number;
            user_type: string;
            permissions: Record<string, number>;
            expired?: string[];
        };
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT s.id as session_id, s.revoked, s.token_expires_at > NOW() as is_live, u.deleted_at, u.id as user_id, u.organization_id, u.temple_id, u.role_id, u.user_status, r.user_role as user_type, r.is_internal, o.org_status, o.deleted_at as org_deleted_at, t.id as valid_temple_id, t.temp_status
             FROM user_auth_sessions s
             JOIN users u ON s.user_id = u.id
             JOIN default_roles r ON r.id = u.role_id
             LEFT JOIN organizations o ON o.id = u.organization_id
             LEFT JOIN temples t ON t.id = u.temple_id AND t.organization_id = u.organization_id AND t.deleted_at IS NULL
             WHERE s.access_token_hash = ?
             LIMIT 1`,
            [hash]
        );

        if (rows[0]?.revoked) return res.status(401).json({ message: 'Session ended', code: 'SESSION_REVOKED' });
        if (!rows[0]?.is_live || rows[0].deleted_at) return res.status(401).json({ message: 'Invalid session' });

        const { user_id, role_id, session_id, user_type } = rows[0];

        if (Number(decoded.id) !== user_id || Number(decoded.sid) !== session_id) return res.status(401).json({ message: 'Invalid session' });

        const is_internal = Boolean(rows[0].is_internal);
        const assignment = resolveAssignment(role_id, is_internal, rows[0].organization_id, rows[0].temple_id);

        if (!assignment) return res.status(403).json({ message: 'Account is not assigned correctly' });

        const organization_id = assignment.organization_id as number;
        const temple_id = assignment.temple_id as number;

        if (temple_id && !rows[0].valid_temple_id) return res.status(403).json({ message: 'Temple does not belong to your organization' });

        const isUserActive = rows[0].user_status === 'active';
        const isOrgActive = !organization_id || (rows[0].org_status === 'active' && !rows[0].org_deleted_at);
        const isTempleActive = !temple_id || rows[0].temp_status === 'active';

        if (!isUserActive || !isOrgActive || !isTempleActive) return res.status(401).json({ message: 'Account disabled', code: 'ACCOUNT_DISABLED' });

        const { permissions, expired } = await resolvePermissions(user_id, role_id, organization_id);

        const samePermissions = JSON.stringify(Object.entries(decoded.permissions || {}).sort()) === JSON.stringify(Object.entries(permissions).sort());
        const sameExpired = [...(decoded.expired || [])].sort().join() === [...expired].sort().join();

        if (decoded.user_type !== user_type || !samePermissions || !sameExpired) {
            await db.execute(`UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE id = ?`, [session_id]);
            return res.status(401).json({ message: 'Your permissions have changed. Please log in again.', code: 'PERMISSIONS_CHANGED' });
        }

        req.user = {
            id: user_id,
            user_type,
            organization_id,
            temple_id,
            role_id,
            is_internal,
            session_id,
            permissions,
            expired
        };

        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const requirePermission = (subModule: string | string[], action: PermissionAction | PermissionAction[] = 'READ') =>
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const permissions = req.user.permissions;
        const codes = Array.isArray(subModule) ? subModule : [subModule];
        const actions = Array.isArray(action) ? action : [action];

        if (!codes.some((code) => actions.some((item) => hasPermission(permissions[code] ?? null, item)))) {
            return res.status(403).json({
                message: `Access denied: ${actions.join(' or ')} permission required for ${codes.join(' or ')}`
            });
        }

        next();
    };

export const scopeTemple = (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.temple_id && req.body && typeof req.body === 'object') req.body.temple_id = req.user.temple_id;
    next();
};
