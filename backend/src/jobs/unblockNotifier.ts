import { RowDataPacket } from 'mysql2';
import db from '../config/database';
import { notifyUnblocked } from '../features/auth/services/securityNotice.service';

const INTERVAL_MS = 5 * 60 * 1000;

const runUnblockNotifier = async () => {
    const [historyRows] = await db.execute<RowDataPacket[]>(
        `SELECT id, user_id, event_type FROM login_history
         WHERE user_id IS NOT NULL
         AND (event_type = 'final_lockout' OR (event_type = 'reset_lockout' AND failure_reason = 'Reset request blocked'))
         AND unblock_notified_at IS NULL
         AND locked_until <= NOW()
         AND locked_until > NOW() - INTERVAL 1 DAY`
    );

    for (const row of historyRows) {
        await db.execute(`UPDATE login_history SET unblock_notified_at = NOW() WHERE id = ?`, [row.id]);
        await notifyUnblocked(Number(row.user_id), row.event_type === 'final_lockout' ? 'login' : 'reset');
    }

    const [resetRows] = await db.execute<RowDataPacket[]>(
        `SELECT email, user_id FROM password_resets
         WHERE block_level >= 3
         AND unblock_notified_at IS NULL
         AND blocked_until <= NOW()
         AND blocked_until > NOW() - INTERVAL 1 DAY`
    );

    for (const row of resetRows) {
        await db.execute(`UPDATE password_resets SET unblock_notified_at = NOW() WHERE email = ?`, [row.email]);
        await notifyUnblocked(Number(row.user_id), 'reset');
    }
};

export const startUnblockNotifier = () => {
    const run = () => runUnblockNotifier().catch((err) => console.error('Unblock notifier failed:', err));
    run();
    setInterval(run, INTERVAL_MS);
};
