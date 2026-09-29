import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import crypto from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { hasPermission, PermissionAction } from '../permissions/permissions';
import { resolveAssignment } from '../utils/scope';

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
            user_type: string;
            permissions: Record<string, number>;
        };
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT s.id as session_id, u.id as user_id, u.organization_id, u.temple_id, u.role_id, r.user_role as user_type
             FROM user_auth_sessions s
             JOIN users u ON s.user_id = u.id
             JOIN default_roles r ON r.id = u.role_id
             WHERE s.access_token_hash = ? AND s.revoked = 0 AND s.token_expires_at > NOW() AND u.deleted_at IS NULL`,
            [hash]
        );

        if (!rows.length) {
            const [revoked] = await db.execute<RowDataPacket[]>(
                `SELECT id FROM user_auth_sessions WHERE access_token_hash = ? AND revoked = 1 LIMIT 1`,
                [hash]
            );
            if (revoked.length) return res.status(401).json({ message: 'Session ended', code: 'SESSION_REVOKED' });
            return res.status(401).json({ message: 'Invalid session' });
        }

        const { user_id, role_id, session_id, user_type } = rows[0];
        const assignment = resolveAssignment(role_id, rows[0].organization_id, rows[0].temple_id);

        if (!assignment) return res.status(403).json({ message: 'Account is not assigned correctly' });

        const organization_id = assignment.organization_id as number;
        const temple_id = assignment.temple_id as number;

        if (temple_id) {
            const [temples] = await db.execute<RowDataPacket[]>(
                `SELECT id FROM temples WHERE id = ? AND organization_id = ? AND deleted_at IS NULL`,
                [temple_id, organization_id]
            );

            if (!temples.length) return res.status(403).json({ message: 'Temple does not belong to your organization' });
        }

        req.user = {
            id: user_id,
            user_type,
            organization_id,
            temple_id,
            role_id,
            session_id,
            permissions: decoded.permissions || {}
        };

        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const requirePermission = (subModule: string, action: PermissionAction = 'READ') =>
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const permission = req.user.permissions[subModule] ?? null;

        if (!hasPermission(permission, action)) {
            return res.status(403).json({
                message: `Access denied: ${action} permission required for ${subModule}`
            });
        }

        next();
    };
