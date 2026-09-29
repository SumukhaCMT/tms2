import db from '../../../config/database';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { isPasswordStrong } from '../../../utils/password-policy';
import { resolveAssignment } from '../../../utils/scope';
import { hashToken, issueResetToken, notifyBlocked, notifyFreeze, findNoticeUser, sendUnblockRequestToAdmins, type BlockKind } from './securityNotice.service';

const JWT_SECRET = String(process.env.JWT_SECRET);
const JWT_EXPIRES_IN = String(process.env.JWT_EXPIRES_IN);

const RESET_MAX_ATTEMPTS_PER_CYCLE = 3;
const RESET_BLOCK_MINUTES: Record<number, number> = { 1: 30, 2: 30, 3: 1440 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


interface PasswordResetRecord extends RowDataPacket {
    email: string;
    user_id: number;
    token_hash: string | null;
    ip_address: string | null;
    request_count: number;
    failed_attempts: number;
    last_requested_at: Date | null;
    expires_at: Date | null;
    blocked_until: Date | null;
    block_level: number;
    used_at: Date | null;
    reset_source: 'request' | 'security_alert';
}

type ResetTokenState = 'VALID' | 'EXPIRED' | 'INVALID' | 'USED' | 'BLOCKED_30' | 'BLOCKED_24H';

interface LoginUserRow extends RowDataPacket {
    id: number;
    role_id: number;
    organization_id: number | null;
    temple_id: number | null;
    user_email: string;
    user_phone: string;
    user_password_hash: string;
    user_status: string;
    user_name: string;
    user_code: string;
    user_type: string;
    org_status: string | null;
    temp_status: string | null;
}

interface LoginHistoryRow extends RowDataPacket {
    login_at: Date;
}

interface LockoutHistoryRow extends RowDataPacket {
    login_at: Date;
    lockout_level: number;
    locked_until: Date;
    event_type: string;
}

interface LockoutSettingsRow extends RowDataPacket {
    max_attempts: number;
    attempts_per_set: number;
    final_block_minutes: number;
}

interface LockoutLevelRow extends RowDataPacket {
    level: number;
    freeze_minutes: number;
}

interface FinalLockoutRow extends RowDataPacket {
    last_final_at: Date | null;
}

interface FailedAttemptRow extends RowDataPacket {
    fail_count: number;
}

interface UserTempleCountsRow extends RowDataPacket {
    user_count: number;
    temple_count: number;
}

interface AuthSessionRow extends RowDataPacket {
    id: number;
    user_id: number;
    role_id: number;
    user_type: string;
    organization_id: number | null;
    temple_id: number | null;
    user_status: string;
    org_status: string | null;
    temp_status: string | null;
}

const evaluateResetRecord = (record: PasswordResetRecord): ResetTokenState => {
    const now = Date.now();

    if (record.blocked_until && new Date(record.blocked_until).getTime() > now) {
        return Number(record.block_level) >= 3 ? 'BLOCKED_24H' : 'BLOCKED_30';
    }

    if (record.used_at) return 'USED';

    if (!record.expires_at || new Date(record.expires_at).getTime() <= now) return 'EXPIRED';

    return 'VALID';
};

const registerFailedResetAttempt = async (conn: PoolConnection, userId: number): Promise<void> => {
    const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT failed_attempts, block_level FROM password_resets WHERE user_id = ? LIMIT 1 FOR UPDATE`,
        [userId]
    );

    if (rows.length === 0) return;

    const current = rows[0];
    const nextFailed = Number(current.failed_attempts) + 1;

    if (nextFailed >= RESET_MAX_ATTEMPTS_PER_CYCLE) {
        const nextLevel = Number(current.block_level) >= 3 ? 3 : Number(current.block_level) + 1;
        const blockMinutes = RESET_BLOCK_MINUTES[nextLevel];

        await conn.execute(
            `UPDATE password_resets SET failed_attempts = 0, block_level = ?, blocked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE), unblock_requested_at = NULL, unblock_notified_at = NULL WHERE user_id = ?`,
            [nextLevel, blockMinutes, userId]
        );

        const notice = nextLevel >= 3 ? notifyBlocked(userId, 'reset', blockMinutes) : notifyFreeze(userId, 'reset', blockMinutes);
        notice.catch((err) => console.error('Failed to send reset block notice:', err));
        return;
    }

    await conn.execute(
        `UPDATE password_resets SET failed_attempts = ? WHERE user_id = ?`,
        [nextFailed, userId]
    );
};

const hasActiveSubscription = async (organizationId: number) => {
    const [subs] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM org_subscriptions WHERE organization_id = ? AND ((license_type = 'perpetual' AND (expiry_date IS NULL OR expiry_date >= CURDATE())) OR (license_type = 'subscription' AND subscription_status = 'active')) LIMIT 1`,
        [organizationId]
    );
    return subs.length > 0;
};

const isWithinOrgLimits = async (organizationId: number, userId: number, templeId: number | null) => {
    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT o.org_default_users, o.org_default_temples,
            (SELECT COUNT(id) FROM users WHERE organization_id = o.id AND deleted_at IS NULL AND id <= ?) AS user_rank,
            (SELECT COUNT(id) FROM temples WHERE organization_id = o.id AND deleted_at IS NULL AND id <= ?) AS temple_rank
         FROM organizations o
         WHERE o.id = ?`,
        [userId, templeId ?? 0, organizationId]
    );
    const limits = rows[0];
    return !!limits && Number(limits.user_rank) <= Number(limits.org_default_users) && Number(limits.temple_rank) <= Number(limits.org_default_temples);
};

const resolvePermissions = async (userId: number, roleId: number) => {
    const [defaults] = await db.execute<RowDataPacket[]>(
        `SELECT sm.sub_module_code, dp.permission
         FROM default_permissions dp
         JOIN sub_modules sm ON sm.id = dp.sub_module_id
         JOIN modules m ON m.id = sm.module_id
         WHERE dp.role_id = ? AND sm.sub_module_status = 'active' AND m.status = 'active'`,
        [roleId]
    );

    const permissionMap: Record<string, number> = {};

    defaults.forEach((row) => {
        permissionMap[row.sub_module_code] = Number(row.permission);
    });

    const [overrides] = await db.execute<RowDataPacket[]>(
        `SELECT sm.sub_module_code, usp.permission
         FROM user_special_permissions usp
         JOIN sub_modules sm ON sm.id = usp.sub_module_id
         JOIN modules m ON m.id = sm.module_id
         WHERE usp.user_id = ? AND sm.sub_module_status = 'active' AND m.status = 'active'`,
        [userId]
    );

    overrides.forEach((row) => {
        permissionMap[row.sub_module_code] = Number(row.permission);
    });

    return permissionMap;
};
export const loginUser = async (login: string, pass: string, ip: string, ua: string) => {
    const [users] = await db.execute<LoginUserRow[]>(
        `SELECT u.*, r.user_role AS user_type, o.org_status, t.temp_status 
         FROM users u
         JOIN default_roles r ON r.id = u.role_id
         LEFT JOIN organizations o ON u.organization_id = o.id
         LEFT JOIN temples t ON u.temple_id = t.id
         WHERE (u.user_email = ? OR u.user_phone = ?) 
         AND u.deleted_at IS NULL
         LIMIT 1`,
        [login, login]
    );

    if (users.length === 0) return { error: 'INVALID_CREDENTIALS' } as const;

    const user = users[0];
    const loggedOrgId = user.organization_id || 0;

    const [successRows] = await db.execute<LoginHistoryRow[]>(
        `SELECT login_at FROM login_history WHERE user_id = ? AND success = 1 AND event_type = 'attempt' ORDER BY login_at DESC LIMIT 1`,
        [user.id]
    );

    const [lockRows] = await db.execute<LockoutHistoryRow[]>(
        `SELECT login_at, lockout_level, locked_until, event_type FROM login_history WHERE user_id = ? AND event_type IN ('lockout', 'final_lockout') ORDER BY login_at DESC LIMIT 1`,
        [user.id]
    );

    const lastSuccessAt = successRows[0]?.login_at || null;
    const lastLock = lockRows[0] || null;
    const lockSinceSuccess = !!lastLock && (!lastSuccessAt || lastLock.login_at > lastSuccessAt);
    const lockedUntil = lockSinceSuccess ? new Date(lastLock.locked_until).getTime() : 0;

    if (lockedUntil > Date.now()) {
        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason, event_type) VALUES (?, ?, ?, ?, ?, ?, 0, 'Login blocked - account locked', 'blocked')`,
            [user.id, loggedOrgId, user.temple_id, login, ip, ua]
        );
        return { error: 'ACCOUNT_LOCKED', minutes: Math.ceil((lockedUntil - Date.now()) / 60000), final: lastLock.event_type === 'final_lockout' } as const;
    }

    if (lockSinceSuccess && user.user_status === 'inactive') {
        await db.execute(`UPDATE users SET user_status = 'active' WHERE id = ?`, [user.id]);
        user.user_status = 'active';
    }

    const validPass = await argon2.verify(user.user_password_hash, pass);

    if (!validPass) {
        const [settingsRows] = await db.execute<LockoutSettingsRow[]>(
            `SELECT max_attempts, attempts_per_set, final_block_minutes FROM login_lockout_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1`
        );
        const [levelRows] = await db.execute<LockoutLevelRow[]>(
            `SELECT level, freeze_minutes FROM login_lockout_levels WHERE lockout_type = 'login' ORDER BY level ASC`
        );
        const [finalRows] = await db.execute<FinalLockoutRow[]>(
            `SELECT MAX(login_at) AS last_final_at FROM login_history WHERE user_id = ? AND event_type = 'final_lockout'`,
            [user.id]
        );

        const settings = settingsRows[0] ?? { max_attempts: 5, attempts_per_set: 5, final_block_minutes: 15 };
        const lastFinalAt = finalRows[0]?.last_final_at ?? null;
        const cycleStart = [lastSuccessAt, lastFinalAt]
            .filter((value): value is Date => !!value)
            .reduce((latest, value) => (value > latest ? value : latest), new Date(0));

        const [failRows] = await db.execute<FailedAttemptRow[]>(
            `SELECT COUNT(*) as fail_count FROM login_history WHERE user_id = ? AND failure_reason = 'Invalid password' AND event_type = 'attempt' AND login_at > ?`,
            [user.id, cycleStart]
        );

        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Invalid password')`,
            [user.id, loggedOrgId, user.temple_id, login, ip, ua]
        );

        const attempts = Number(failRows[0].fail_count) + 1;
        const isFinal = attempts >= Number(settings.max_attempts);
        const isSetEnd = attempts % Number(settings.attempts_per_set) === 0;

        if (!isFinal && !isSetEnd) {
            return { error: 'INVALID_CREDENTIALS' } as const;
        }

        const level = isFinal ? 0 : attempts / Number(settings.attempts_per_set);
        const levelMinutes = levelRows.find((row) => Number(row.level) === level) ?? levelRows[levelRows.length - 1];
        const minutes = isFinal ? Number(settings.final_block_minutes) : Number(levelMinutes?.freeze_minutes ?? settings.final_block_minutes);

        await db.execute(`UPDATE users SET user_status = 'inactive' WHERE id = ?`, [user.id]);
        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason, event_type, lockout_level, locked_until) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
            [user.id, loggedOrgId, user.temple_id, login, ip, ua, isFinal ? 'Account blocked' : 'Account locked', isFinal ? 'final_lockout' : 'lockout', level, minutes]
        );

        const notice = isFinal ? notifyBlocked(user.id, 'login', minutes) : notifyFreeze(user.id, 'login', minutes);
        notice.catch((err) => console.error('Failed to send login block notice:', err));

        return { error: 'ACCOUNT_LOCKED', minutes, final: isFinal } as const;
    }

    const assignment = resolveAssignment(user.role_id, user.organization_id, user.temple_id);
    const isOrgActive = user.org_status === 'active';
    const isUserActive = user.user_status === 'active';
    const isTempleActive = !assignment?.temple_id || user.temp_status === 'active';

    if (!assignment || !isUserActive || (assignment.organization_id && !isOrgActive) || !isTempleActive) {
        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Account disabled')`,
            [user.id, loggedOrgId, user.temple_id, login, ip, ua]
        );
        return { error: 'ACCOUNT_DISABLED' } as const;
    }

    user.organization_id = assignment.organization_id;
    user.temple_id = assignment.temple_id;

    if (user.organization_id) {
        if (!(await hasActiveSubscription(user.organization_id))) {
            await db.execute(
                `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Subscription inactive')`,
                [user.id, loggedOrgId, user.temple_id, login, ip, ua]
            );
            return { error: 'SUBSCRIPTION_INACTIVE' } as const;
        }

        if (!(await isWithinOrgLimits(user.organization_id, user.id, user.temple_id))) {
            await db.execute(
                `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Limit exceeded')`,
                [user.id, loggedOrgId, user.temple_id, login, ip, ua]
            );
            return { error: 'LIMIT_EXCEEDED' } as const;
        }
    }

    await db.execute(
        `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, login_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
        [user.id, loggedOrgId, user.temple_id, login, ip, ua]
    );

    await db.execute(`UPDATE users SET user_last_login_at = NOW() WHERE id = ?`, [user.id]);

    const permissions = await resolvePermissions(user.id, user.role_id);

    const accessToken = jwt.sign(
        {
            id: user.id,
            user_type: user.user_type,
            permissions
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    const decodedToken = jwt.decode(accessToken) as jwt.JwtPayload;
    const tokenExp = new Date((decodedToken.exp as number) * 1000);
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);
    await db.execute(
        `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE user_id = ? AND revoked = 0`,
        [user.id]
    );
    await db.execute(
        `INSERT INTO user_auth_sessions 
        (user_id, organization_id, temple_id, provider, access_token_hash, refresh_token_hash, token_expires_at, refresh_expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user.id,
            user.organization_id,
            user.temple_id,
            'normal',
            accessTokenHash,
            refreshTokenHash,
            tokenExp,
            refreshExp,
            ip,
            ua
        ]
    );

    const isOrgScope = !!user.organization_id && !user.temple_id;

    const [counts] = isOrgScope
        ? await db.execute<UserTempleCountsRow[]>(
            `SELECT
                (SELECT COUNT(id) FROM users WHERE organization_id = ? AND deleted_at IS NULL) as user_count,
                (SELECT COUNT(id) FROM temples WHERE organization_id = ? AND deleted_at IS NULL) as temple_count`,
            [user.organization_id, user.organization_id]
        )
        : [[]];

    const [temples] = isOrgScope
        ? await db.execute<RowDataPacket[]>(
            `SELECT id, temp_name FROM temples WHERE organization_id = ? AND deleted_at IS NULL ORDER BY temp_name ASC`,
            [user.organization_id]
        )
        : [[]];

    const returnUser = {
        id: user.id,
        name: user.user_name,
        user_type: user.user_type,
        role_id: user.role_id,
        user_code: user.user_code,
        email: user.user_email,
        phone: user.user_phone,
        organization_id: user.organization_id,
        temple_id: user.temple_id,
        permissions,
        ...(isOrgScope && {
            number_of_users: counts[0]?.user_count,
            number_of_temples: counts[0]?.temple_count,
            temples
        })
    };

    return {
        message: 'Login successful',
        access_token: accessToken,
        refresh_token: refreshToken,
        user: returnUser
    };
};
export const logoutUser = async (token: string) => {
    const hash = hashToken(token);

    const [sessions] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM user_auth_sessions WHERE access_token_hash = ?`,
        [hash]
    );

    if (sessions.length > 0) {
        const sessionId = sessions[0].id;

        await db.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE id = ?`,
            [sessionId]
        );
    }
};

type ForgotPasswordResult =
    | { code: 'RESET_REQUESTED'; email: string; name: string; rawToken: string }
    | { code: 'RESET_REQUESTED_NO_ACCOUNT' }
    | { code: 'PHONE_NO_EMAIL' }
    | { code: 'RESET_REQUEST_LIMITED'; minutes: number; final: boolean }
    | { code: 'BLOCKED_30'; blockedUntil: Date | null }
    | { code: 'BLOCKED_24H'; blockedUntil: Date | null };

const resolveResetTarget = async (identifier: string): Promise<{ id: number; email: string; name: string } | null> => {
    const isEmail = EMAIL_PATTERN.test(identifier);

    const [users] = await db.execute<RowDataPacket[]>(
        isEmail
            ? `SELECT id, user_email AS email, user_name AS name FROM users WHERE user_email = ? AND deleted_at IS NULL LIMIT 1`
            : `SELECT id, user_email AS email, user_name AS name FROM users WHERE user_phone = ? AND deleted_at IS NULL LIMIT 1`,
        [identifier]
    );

    if (users.length === 0) return null;

    const user = users[0];
    if (!user.email) return null;

    return { id: user.id, email: user.email, name: user.name };
};

export const requestPasswordReset = async (identifier: string, ip: string, ua: string): Promise<ForgotPasswordResult> => {
    const isEmail = EMAIL_PATTERN.test(identifier);

    const [lockRows] = await db.execute<RowDataPacket[]>(
        `SELECT login_at, lockout_level, locked_until, failure_reason FROM login_history
         WHERE login_input = ? AND ip_address = ? AND event_type = 'reset_lockout'
         ORDER BY login_at DESC LIMIT 1`,
        [identifier, ip]
    );

    const lastLock = lockRows[0] || null;
    const currentLevel = lastLock ? Number(lastLock.lockout_level) : 0;

    const lockedUntil = lastLock?.locked_until ? new Date(lastLock.locked_until).getTime() : 0;

    if (lockedUntil > Date.now()) {
        return {
            code: 'RESET_REQUEST_LIMITED',
            minutes: Math.ceil((lockedUntil - Date.now()) / 60000),
            final: lastLock.failure_reason === 'Reset request blocked'
        };
    }

    const resetPoint = lastLock ? lastLock.login_at : new Date(0);

    const [requestRows] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM login_history
         WHERE login_input = ? AND ip_address = ? AND event_type = 'reset_request'
         AND login_at > ?`,
        [identifier, ip, resetPoint]
    );

    const priorCount = Number(requestRows[0]?.cnt || 0);

    const [requestSettingsRows] = await db.execute<RowDataPacket[]>(
        `SELECT reset_request_max_attempts FROM login_lockout_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1`
    );
    const maxRequests = Number(requestSettingsRows[0]?.reset_request_max_attempts ?? 3);

    if (priorCount >= maxRequests) {
        const [levelRows] = await db.execute<LockoutLevelRow[]>(
            `SELECT level, freeze_minutes FROM login_lockout_levels WHERE lockout_type = 'reset_request' ORDER BY level ASC`
        );
        const maxLevel = levelRows.length ? Number(levelRows[levelRows.length - 1].level) : 1;
        const level = Math.min(currentLevel + 1, maxLevel);
        const levelRow = levelRows.find((row) => Number(row.level) === level) ?? levelRows[levelRows.length - 1];
        const minutes = Number(levelRow?.freeze_minutes ?? 60);
        const isFinal = level >= maxLevel;
        const blockedTarget = await resolveResetTarget(identifier);

        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason, event_type, lockout_level, locked_until)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'reset_lockout', ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
            [blockedTarget?.id ?? null, 0, null, identifier, ip, ua, isFinal ? 'Reset request blocked' : 'Reset request limited', level, minutes]
        );

        if (blockedTarget) {
            const notice = isFinal ? notifyBlocked(blockedTarget.id, 'reset', minutes) : notifyFreeze(blockedTarget.id, 'reset', minutes);
            notice.catch((err) => console.error('Failed to send reset request block notice:', err));
        }

        return { code: 'RESET_REQUEST_LIMITED', minutes, final: isFinal };
    }

    const target = await resolveResetTarget(identifier);

    await db.execute(
        `INSERT INTO login_history (user_id, organization_id, temple_id, login_input, ip_address, user_agent, success, failure_reason, event_type)
         VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 'reset_request')`,
        [target?.id ?? null, 0, null, identifier, ip, ua]
    );

    if (!target) {
        return isEmail ? { code: 'RESET_REQUESTED_NO_ACCOUNT' } : { code: 'PHONE_NO_EMAIL' };
    }

    const [existingRows] = await db.execute<RowDataPacket[]>(
        `SELECT block_level, blocked_until FROM password_resets WHERE user_id = ? LIMIT 1`,
        [target.id]
    );

    const existing = existingRows[0];

    if (existing && existing.blocked_until && new Date(existing.blocked_until).getTime() > Date.now()) {
        return {
            code: Number(existing.block_level) >= 3 ? 'BLOCKED_24H' : 'BLOCKED_30',
            blockedUntil: existing.blocked_until
        };
    }

    const rawToken = await issueResetToken(target.id, target.email, ip);

    return { code: 'RESET_REQUESTED', email: target.email, name: target.name, rawToken };
};

export const validateResetToken = async (rawToken: string): Promise<{ code: ResetTokenState; blockedUntil: Date | null }> => {
    const tokenHash = hashToken(rawToken);
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.execute<PasswordResetRecord[]>(
            `SELECT * FROM password_resets WHERE token_hash = ? LIMIT 1`,
            [tokenHash]
        );

        if (rows.length === 0) {
            await conn.commit();
            return { code: 'INVALID', blockedUntil: null };
        }

        const record = rows[0];
        const initialState = evaluateResetRecord(record);

        if (initialState === 'EXPIRED' || initialState === 'USED') {
            await registerFailedResetAttempt(conn, record.user_id);

            const [refreshed] = await conn.execute<PasswordResetRecord[]>(
                `SELECT * FROM password_resets WHERE user_id = ? LIMIT 1`,
                [record.user_id]
            );

            await conn.commit();
            const finalRecord = refreshed[0];
            return { code: evaluateResetRecord(finalRecord), blockedUntil: finalRecord.blocked_until };
        }

        await conn.commit();
        return { code: initialState, blockedUntil: record.blocked_until };
    } catch {
        await conn.rollback();
        return { code: 'INVALID', blockedUntil: null };
    } finally {
        conn.release();
    }
};

type ResetPasswordResult =
    | { code: 'SUCCESS'; email: string; name: string; fromSecurityAlert: boolean }
    | { code: 'INVALID' }
    | { code: 'EXPIRED' }
    | { code: 'USED' }
    | { code: 'BLOCKED_30'; blockedUntil: Date | null }
    | { code: 'BLOCKED_24H'; blockedUntil: Date | null }
    | { code: 'WEAK_PASSWORD' };

export const resetPassword = async (rawToken: string, newPassword: string): Promise<ResetPasswordResult> => {
    const tokenHash = hashToken(rawToken);
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.execute<PasswordResetRecord[]>(
            `SELECT * FROM password_resets WHERE token_hash = ? LIMIT 1 FOR UPDATE`,
            [tokenHash]
        );

        if (rows.length === 0) {
            await conn.commit();
            return { code: 'INVALID' };
        }

        const record = rows[0];
        const state = evaluateResetRecord(record);

        if (state !== 'VALID') {
            if (state === 'EXPIRED' || state === 'USED') {
                await registerFailedResetAttempt(conn, record.user_id);
            }

            const [refreshed] = await conn.execute<PasswordResetRecord[]>(
                `SELECT * FROM password_resets WHERE user_id = ? LIMIT 1`,
                [record.user_id]
            );

            await conn.commit();
            const finalRecord = refreshed[0];
            const finalState = evaluateResetRecord(finalRecord);

            if (finalState === 'BLOCKED_30' || finalState === 'BLOCKED_24H') {
                return { code: finalState, blockedUntil: finalRecord.blocked_until };
            }

            return { code: finalState === 'VALID' ? 'INVALID' : finalState };
        }

        if (!isPasswordStrong(newPassword)) {
            await conn.commit();
            return { code: 'WEAK_PASSWORD' };
        }

        const [users] = await conn.execute<RowDataPacket[]>(
            `SELECT id, user_name FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
            [record.user_id]
        );

        if (users.length === 0) {
            await conn.commit();
            return { code: 'INVALID' };
        }

        const userId = users[0].id;
        const userName = users[0].user_name;
        const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

        await conn.execute(`UPDATE users SET user_password_hash = ? WHERE id = ?`, [passwordHash, userId]);

        await conn.execute(
            `UPDATE password_resets SET used_at = NOW(), failed_attempts = 0, block_level = 0, blocked_until = NULL WHERE user_id = ?`,
            [record.user_id]
        );

        await conn.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE user_id = ?`,
            [userId]
        );

        await conn.commit();
        return { code: 'SUCCESS', email: record.email, name: userName, fromSecurityAlert: record.reset_source === 'security_alert' };
    } catch {
        await conn.rollback();
        return { code: 'INVALID' };
    } finally {
        conn.release();
    }
};

export const refreshAccessToken = async (oldRefreshToken: string, _ip: string, _ua: string) => {
    try {
        // 1. Verify the token signature
        jwt.verify(oldRefreshToken, JWT_SECRET);
        const oldHash = hashToken(oldRefreshToken);
        const [sessions] = await db.execute<AuthSessionRow[]>(
            `SELECT s.*, u.role_id, r.user_role AS user_type, u.organization_id, u.temple_id, u.user_status, o.org_status, t.temp_status
             FROM user_auth_sessions s
             JOIN users u ON s.user_id = u.id
             JOIN default_roles r ON r.id = u.role_id
             LEFT JOIN organizations o ON u.organization_id = o.id
             LEFT JOIN temples t ON u.temple_id = t.id
             WHERE s.refresh_token_hash = ? AND s.revoked = 0 AND s.refresh_expires_at > NOW() AND u.deleted_at IS NULL`,
            [oldHash]
        );

        if (sessions.length === 0) return { error: 'INVALID_REFRESH_TOKEN' } as const;
        const session = sessions[0];
        const assignment = resolveAssignment(session.role_id, session.organization_id, session.temple_id);
        const isUserActive = session.user_status === 'active';
        const isOrgActive = session.org_status === 'active';
        const isTempleActive = !assignment?.temple_id || session.temp_status === 'active';

        if (!assignment || !isUserActive || (assignment.organization_id && !isOrgActive) || !isTempleActive) {
            return { error: 'ACCOUNT_DISABLED' } as const;
        }

        if (assignment.organization_id && !(await hasActiveSubscription(assignment.organization_id))) {
            return { error: 'SUBSCRIPTION_INACTIVE' } as const;
        }

        if (assignment.organization_id && !(await isWithinOrgLimits(assignment.organization_id, session.user_id, assignment.temple_id))) {
            return { error: 'LIMIT_EXCEEDED' } as const;
        }

        // 3. Resolve fresh permissions
        const perms = await resolvePermissions(session.user_id, session.role_id);

        // 4. Generate NEW Access Token
        const newAccessToken = jwt.sign(
            { id: session.user_id, user_type: session.user_type, permissions: perms },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
        );

        const newAccessHash = hashToken(newAccessToken);
        const decodedNew = jwt.decode(newAccessToken) as jwt.JwtPayload;
        const newExp = new Date((decodedNew.exp as number) * 1000);

        const newRefreshToken = jwt.sign({ id: session.user_id }, JWT_SECRET, { expiresIn: '7d' });
        const newRefreshHash = hashToken(newRefreshToken);
        const newRefreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 5. Update session with new access token hash and rotated refresh token hash
        await db.execute(
            `UPDATE user_auth_sessions SET access_token_hash = ?, token_expires_at = ?, refresh_token_hash = ?, refresh_expires_at = ? WHERE id = ?`,
            [newAccessHash, newExp, newRefreshHash, newRefreshExp, session.id]
        );

        return { access_token: newAccessToken, refresh_token: newRefreshToken, permissions: perms };
    } catch {
        return { error: 'INVALID_REFRESH_TOKEN' } as const;
    }
};

export const changePassword = async (token: string, oldPassword: string, newPassword: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        const userId = decoded.id;
        const [users] = await db.execute<RowDataPacket[]>(
            `SELECT user_password_hash FROM users WHERE id = ? AND deleted_at IS NULL`,
            [userId]
        );
        if (users.length === 0) return { error: 'USER_NOT_FOUND' } as const;

        const user = users[0];
        const validPass = await argon2.verify(user.user_password_hash, oldPassword);
        if (!validPass) return { error: 'INVALID_OLD_PASSWORD' } as const;
        const newHash = await argon2.hash(newPassword, { type: argon2.argon2id });

        await db.execute(`UPDATE users SET user_password_hash = ? WHERE id = ?`, [newHash, userId]);
        await db.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE user_id = ?`,
            [userId]
        );
        return { success: true };
    }

    catch {
        return { error: 'CHANGE_PASSWORD_FAILED' } as const;
    }
}

type UnblockRequestResult = { code: 'REQUESTED' | 'ALREADY_REQUESTED' | 'NOT_BLOCKED' | 'NO_ADMIN' };

export const requestAccountUnblock = async (login: string | null, rawToken: string | null): Promise<UnblockRequestResult> => {
    const [userRows] = login
        ? await db.execute<RowDataPacket[]>(
            `SELECT id FROM users WHERE (user_email = ? OR user_phone = ?) AND deleted_at IS NULL LIMIT 1`,
            [login, login]
        )
        : await db.execute<RowDataPacket[]>(
            `SELECT user_id AS id FROM password_resets WHERE token_hash = ? LIMIT 1`,
            [hashToken(rawToken ?? '')]
        );

    const userId = userRows[0]?.id as number | undefined;
    if (!userId) return { code: 'NOT_BLOCKED' };

    const [loginBlocks] = await db.execute<RowDataPacket[]>(
        `SELECT id, event_type, unblock_requested_at FROM login_history
         WHERE user_id = ? AND locked_until > NOW()
         AND (event_type = 'final_lockout' OR (event_type = 'reset_lockout' AND failure_reason = 'Reset request blocked'))
         ORDER BY event_type = 'final_lockout' DESC, id DESC`,
        [userId]
    );
    const [resetBlocks] = await db.execute<RowDataPacket[]>(
        `SELECT email, unblock_requested_at FROM password_resets WHERE user_id = ? AND block_level >= 3 AND blocked_until > NOW()`,
        [userId]
    );

    if (!loginBlocks.length && !resetBlocks.length) return { code: 'NOT_BLOCKED' };
    if ([...loginBlocks, ...resetBlocks].every((row) => row.unblock_requested_at)) return { code: 'ALREADY_REQUESTED' };

    const user = await findNoticeUser(userId);
    if (!user) return { code: 'NOT_BLOCKED' };

    const kind: BlockKind = loginBlocks[0]?.event_type === 'final_lockout' ? 'login' : 'reset';
    const adminCount = await sendUnblockRequestToAdmins(user, kind);
    if (!adminCount) return { code: 'NO_ADMIN' };

    await db.execute(
        `UPDATE login_history SET unblock_requested_at = NOW()
         WHERE user_id = ? AND locked_until > NOW()
         AND (event_type = 'final_lockout' OR (event_type = 'reset_lockout' AND failure_reason = 'Reset request blocked'))`,
        [userId]
    );
    await db.execute(
        `UPDATE password_resets SET unblock_requested_at = NOW() WHERE user_id = ? AND block_level >= 3 AND blocked_until > NOW()`,
        [userId]
    );

    return { code: 'REQUESTED' };
};
