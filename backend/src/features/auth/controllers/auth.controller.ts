import { Request, Response } from 'express';
import { loginUser, logoutUser, requestPasswordReset, validateResetToken, resetPassword, changePassword, refreshAccessToken, requestAccountUnblock } from '../services/auth.service';
import { formatDuration } from '../services/securityNotice.service';
import { sendMail } from '../../../utils/mail';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const login = async (req: Request, res: Response) => {
  const { login, password } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress as string;
  const ua = req.headers['user-agent'] as string;

  const result: Awaited<ReturnType<typeof loginUser>> = await loginUser(login, password, ip, ua);

  if (result.error === 'INVALID_CREDENTIALS') return res.status(401).json({ message: 'Invalid credentials' });
  if (result.error === 'ACCOUNT_DISABLED') return res.status(403).json({ message: 'Account disabled' });
  if (result.error === 'SUBSCRIPTION_INACTIVE') return res.status(403).json({ message: 'Your subscription is not active. Please renew your subscription.', code: 'SUBSCRIPTION_INACTIVE' });
  if (result.error === 'LIMIT_EXCEEDED') return res.status(403).json({ message: 'You are not allowed to login. Your organization has reached its user or temple limit.', code: 'LIMIT_EXCEEDED' });
  if (result.error === 'ACCOUNT_LOCKED' && result.final) {
    return res.status(403).json({
      message: `Your account is blocked for ${formatDuration(result.minutes)} after too many failed login attempts. To remove this block, contact your administrator.`,
      code: 'ACCOUNT_BLOCKED',
      minutes: result.minutes
    });
  }
  if (result.error === 'ACCOUNT_LOCKED') {
    return res.status(403).json({
      message: `Too many wrong attempts. Try again after ${formatDuration(result.minutes)}.`,
      code: 'ACCOUNT_LOCKED',
      minutes: result.minutes
    });
  }

  res.cookie('refresh_token', result.refresh_token, REFRESH_COOKIE_OPTIONS);
  res.json({ message: result.message, access_token: result.access_token, user: result.user });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress as string;
  const ua = req.headers['user-agent'] as string;

  if (!token) return res.status(401).json({ message: 'No refresh token' });

  const result: Awaited<ReturnType<typeof refreshAccessToken>> = await refreshAccessToken(token, ip, ua);

  if (result.error) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.status(401).json({ message: 'Session expired, please login again' });
  }

  res.cookie('refresh_token', result.refresh_token, REFRESH_COOKIE_OPTIONS);
  res.json({ access_token: result.access_token, permissions: result.permissions });
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    await logoutUser(token);
  }

  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.json({ success: true });
};

const RESET_STATUS_CODES: Record<string, number> = {
  VALID: 200,
  SUCCESS: 200,
  EXPIRED: 400,
  INVALID: 400,
  USED: 400,
  WEAK_PASSWORD: 400,
  PHONE_NO_EMAIL: 400,
  BLOCKED_30: 429,
  BLOCKED_24H: 429
};

const RESET_STATUS_MESSAGES: Record<string, string> = {
  VALID: 'Reset link is valid.',
  SUCCESS: 'Password updated successfully.',
  EXPIRED: 'This password reset link has expired.',
  INVALID: 'This password reset link is invalid.',
  USED: 'This password reset link has already been used.',
  WEAK_PASSWORD: 'Password does not meet the required strength.',
  PHONE_NO_EMAIL: 'No email address is associated with this phone number.',
  BLOCKED_30: 'Password reset is temporarily blocked. Please try again later.',
  BLOCKED_24H: 'Password reset is blocked for 24 hours due to repeated failed attempts. Please contact your administrator.'
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email or phone number is required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress as string;
    const ua = req.headers['user-agent'] as string;
    const result = await requestPasswordReset(identifier.trim(), ip, ua);

    if (result.code === 'PHONE_NO_EMAIL') {
      return res.status(RESET_STATUS_CODES.PHONE_NO_EMAIL).json({ code: 'PHONE_NO_EMAIL', message: RESET_STATUS_MESSAGES.PHONE_NO_EMAIL });
    }

    if (result.code === 'RESET_REQUEST_LIMITED') {
      return res.status(429).json({
        code: result.final ? 'RESET_REQUEST_BLOCKED' : 'RESET_REQUEST_LIMITED',
        message: result.final
          ? `Password reset is blocked for ${formatDuration(result.minutes)} after too many requests. To remove this block, contact your administrator.`
          : `Password reset request has been limited. Try again after ${formatDuration(result.minutes)}.`,
        minutes: result.minutes
      });
    }

    if (result.code === 'BLOCKED_30' || result.code === 'BLOCKED_24H') {
      return res.status(RESET_STATUS_CODES[result.code]).json({
        code: result.code,
        message: RESET_STATUS_MESSAGES[result.code],
        blockedUntil: result.blockedUntil
      });
    }

    if (result.code === 'RESET_REQUESTED') {
      const link = `${process.env.CLIENT_URL}/reset-password?token=${result.rawToken}`;
      const templatePath = path.join(__dirname, '../../../templates/reset-password.mjml');

      if (fs.existsSync(templatePath)) {
        let content = fs.readFileSync(templatePath, 'utf8');
        content = content.replace(/{{name}}/g, result.name).replace(/{{resetLink}}/g, link);

        // Don't block the response on SMTP delivery — the reset token's TTL is
        // short, so every second spent here before responding eats into the
        // window the user has to actually click the link. Fire-and-forget.
        mjml2html(content)
          .then(({ html }) =>
            sendMail({
              to: result.email,
              subject: 'Reset Your Password',
              html,
              text: `Hi ${result.name}, Reset Link: ${link}`
            })
          )
          .catch((err) => console.error('Failed to send reset password email:', err));
      }
    }

    return res.status(200).json({ code: 'RESET_REQUESTED', message: 'If an account exists for this identifier, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateResetTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ code: 'INVALID', message: RESET_STATUS_MESSAGES.INVALID });
    }

    const result = await validateResetToken(token);

    return res.status(RESET_STATUS_CODES[result.code]).json({
      code: result.code,
      message: RESET_STATUS_MESSAGES[result.code],
      blockedUntil: result.blockedUntil
    });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ code: 'INVALID', message: RESET_STATUS_MESSAGES.INVALID });
    }

    const result = await resetPassword(token, password);

    if (result.code !== 'SUCCESS') {
      return res.status(RESET_STATUS_CODES[result.code]).json({
        code: result.code,
        message: RESET_STATUS_MESSAGES[result.code],
        blockedUntil: 'blockedUntil' in result ? result.blockedUntil : undefined
      });
    }

    const loginLink = `${process.env.CLIENT_URL}/login`;
    const templatePath = path.join(__dirname, '../../../templates/password-changed.mjml');

    if (fs.existsSync(templatePath)) {
      let content = fs.readFileSync(templatePath, 'utf8');
      content = content.replace(/{{name}}/g, result.name).replace(/{{loginLink}}/g, loginLink);
      if (result.fromSecurityAlert) {
        content = content.replace(
          'You can now login to your account with your new credentials.',
          'You can login to your account with your new credentials once the block on your account has been removed.'
        );
      }
      const { html } = await mjml2html(content);

      await sendMail({
        to: result.email,
        subject: 'Password Changed Successfully',
        html,
        text: `Hi ${result.name}, Your password has been changed.`
      });
    }

    return res.status(200).json({
      code: 'SUCCESS',
      message: result.fromSecurityAlert
        ? 'Password changed successfully. You can login once the block on your account has been removed.'
        : RESET_STATUS_MESSAGES.SUCCESS,
      fromSecurityAlert: result.fromSecurityAlert
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { oldPassword, newPassword } = req.body

    //  basic validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required',
      })
    }

    const result: Awaited<ReturnType<typeof changePassword>> = await changePassword(
      token,
      oldPassword,
      newPassword
    )

    //  HANDLE ALL POSSIBLE ERRORS
    if (result.error === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' })
    }

    if (result.error === 'INVALID_OLD_PASSWORD') {
      return res.status(400).json({
        message: 'Old password is incorrect',
      })
    }

    if (result.error === 'CHANGE_PASSWORD_FAILED') {
      return res.status(500).json({
        message: 'Something went wrong. Please try again',
      })
    }

    return res.json({
      message: 'Password changed successfully',
    })

  } catch (error) {
    console.error('Change password error:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

const UNBLOCK_REQUEST_RESPONSES = {
  REQUESTED: { status: 200, message: 'Your request has been sent to your administrator.' },
  ALREADY_REQUESTED: { status: 200, message: 'Your request has already been sent. Your administrator will review it.' },
  NOT_BLOCKED: { status: 400, message: 'There is no active block on this account.' },
  NO_ADMIN: { status: 404, message: 'No administrator is available to receive your request. Please contact support.' }
} as const;

export const unblockRequestController = async (req: Request, res: Response) => {
  const { login, token } = req.body as { login?: unknown; token?: unknown };
  const loginValue = typeof login === 'string' && login.trim() ? login.trim() : null;
  const tokenValue = typeof token === 'string' && token.trim() ? token.trim() : null;

  if (!loginValue && !tokenValue) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email or phone number is required' });
  }

  const result = await requestAccountUnblock(loginValue, tokenValue);
  const response = UNBLOCK_REQUEST_RESPONSES[result.code];

  return res.status(response.status).json({ code: result.code, message: response.message });
};
