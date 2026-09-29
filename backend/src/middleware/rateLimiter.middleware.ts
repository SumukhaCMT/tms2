import rateLimit from 'express-rate-limit';

export const forgotPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many password reset requests. Please try again after 15 minutes.', code: 'RATE_LIMITED' }
});

export const resetAttemptRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many reset attempts. Please try again after 15 minutes.', code: 'RATE_LIMITED' }
});
