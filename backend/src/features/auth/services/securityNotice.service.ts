import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import db from '../../../config/database';
import { sendNoticeMail } from '../../../utils/noticeMail';

export type BlockKind = 'login' | 'reset';

interface NoticeUser {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role_id: number;
    organization_id: number | null;
}

export const RESET_TOKEN_TTL_MINUTES = 5;

const clientUrl = () => String(process.env.CLIENT_URL);

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const formatDuration = (minutes: number) => {
    if (minutes >= 60 && minutes % 60 === 0) {
        const hours = minutes / 60;
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export const findNoticeUser = async (userId: number): Promise<NoticeUser | null> => {
    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT id, user_name AS name, user_email AS email, user_phone AS phone, role_id, organization_id FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [userId]
    );
    return (rows[0] as NoticeUser | undefined) ?? null;
};

export const issueResetToken = async (userId: number, email: string, ip: string | null, source: 'request' | 'security_alert' = 'request'): Promise<string> => {
    const rawToken = crypto.randomBytes(32).toString('hex');

    await db.execute(
        `INSERT INTO password_resets (email, user_id, token_hash, ip_address, request_count, failed_attempts, last_requested_at, expires_at, used_at, reset_source)
         VALUES (?, ?, ?, ?, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE), NULL, ?)
         ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            token_hash = VALUES(token_hash),
            ip_address = VALUES(ip_address),
            request_count = request_count + 1,
            last_requested_at = VALUES(last_requested_at),
            expires_at = VALUES(expires_at),
            used_at = NULL,
            reset_source = VALUES(reset_source)`,
        [email, userId, hashToken(rawToken), ip, RESET_TOKEN_TTL_MINUTES, source]
    );

    return rawToken;
};

const isResetBlocked = async (userId: number) => {
    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT email FROM password_resets WHERE user_id = ? AND blocked_until > NOW() LIMIT 1`,
        [userId]
    );
    return rows.length > 0;
};

export const notifyFreeze = async (userId: number, kind: BlockKind, minutes: number) => {
    const user = await findNoticeUser(userId);
    if (!user?.email) return;

    const duration = formatDuration(minutes);

    if (kind === 'reset') {
        sendNoticeMail({
            to: user.email,
            name: user.name,
            subject: 'Suspicious activity on your account',
            message: `We noticed repeated failed password reset attempts on your account, so password reset has been paused for ${duration}.\nIf this wasn't you, please contact your administrator.`
        });
        return;
    }

    if (await isResetBlocked(user.id)) {
        sendNoticeMail({
            to: user.email,
            name: user.name,
            subject: 'Suspicious activity on your account',
            message: `We noticed several failed login attempts on your account, so it has been locked for ${duration}.\nIf this wasn't you, please contact your administrator.`
        });
        return;
    }

    const rawToken = await issueResetToken(user.id, user.email, null, 'security_alert');

    sendNoticeMail({
        to: user.email,
        name: user.name,
        subject: 'Suspicious activity on your account',
        message: `We noticed several failed login attempts on your account, so it has been locked for ${duration}.\nIf this wasn't you, change your password now using the button below.`,
        button: {
            label: 'CHANGE PASSWORD',
            link: `${clientUrl()}/reset-password?token=${rawToken}`,
            note: `This link will expire in ${formatDuration(RESET_TOKEN_TTL_MINUTES)}.`
        }
    });
};

export const notifyBlocked = async (userId: number, kind: BlockKind, minutes: number) => {
    const user = await findNoticeUser(userId);
    if (!user?.email) return;

    const duration = formatDuration(minutes);

    sendNoticeMail({
        to: user.email,
        name: user.name,
        subject: kind === 'login' ? `Your account is blocked for ${duration}` : `Password reset is blocked for ${duration}`,
        message:
            kind === 'login'
                ? `Your account has been blocked for ${duration} after too many failed login attempts.\nIf you want this block removed, please contact your administrator.`
                : `Password reset for your account has been blocked for ${duration} after too many failed attempts.\nIf you want this block removed, please contact your administrator.`
    });
};

export const notifyUnblocked = async (userId: number, kind: BlockKind) => {
    const user = await findNoticeUser(userId);
    if (!user?.email) return;

    sendNoticeMail({
        to: user.email,
        name: user.name,
        subject: kind === 'login' ? 'Your account is unblocked' : 'Password reset is unblocked',
        message:
            kind === 'login'
                ? 'Your account has been unblocked. You can log in again.'
                : 'Password reset for your account has been unblocked. You can request a new reset link again.',
        button:
            kind === 'login'
                ? { label: 'LOGIN', link: `${clientUrl()}/login` }
                : { label: 'RESET PASSWORD', link: `${clientUrl()}/forgot-password` }
    });
};

export const sendUnblockRequestToAdmins = async (user: NoticeUser, kind: BlockKind) => {
    const [admins] = await db.execute<RowDataPacket[]>(
        user.role_id === 2 || !user.organization_id
            ? `SELECT user_name AS name, user_email AS email FROM users WHERE role_id = 1 AND deleted_at IS NULL AND user_status = 'active' AND user_email IS NOT NULL`
            : `SELECT user_name AS name, user_email AS email FROM users WHERE role_id = 2 AND organization_id = ? AND deleted_at IS NULL AND user_status = 'active' AND user_email IS NOT NULL`,
        user.role_id === 2 || !user.organization_id ? [] : [user.organization_id]
    );

    const blockText = kind === 'login' ? 'their account is blocked after too many failed login attempts' : 'password reset is blocked for their account after too many failed attempts';
    const contact = [user.email, user.phone].filter(Boolean).join(' · ');

    for (const admin of admins) {
        sendNoticeMail({
            to: admin.email,
            name: admin.name,
            subject: `Unblock request from ${user.name}`,
            message: `${user.name} (${contact}) has requested to be unblocked because ${blockText}.\nPlease review and reactivate the account if appropriate.`
        });
    }

    return admins.length;
};
