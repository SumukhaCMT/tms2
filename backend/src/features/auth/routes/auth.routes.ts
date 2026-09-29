import { Router } from 'express';
import { login, logout, forgotPassword, validateResetTokenController, resetPasswordController, changePasswordController, refresh, unblockRequestController } from '../controllers/auth.controller';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authenticate } from '../../../middleware/auth.middleware';
import { forgotPasswordRateLimiter, resetAttemptRateLimiter } from '../../../middleware/rateLimiter.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/unblock-request', forgotPasswordRateLimiter, asyncHandler(unblockRequestController));
router.get('/validate-reset-token', resetAttemptRateLimiter, validateResetTokenController);
router.post('/reset-password', resetAttemptRateLimiter, resetPasswordController);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.put('/change-password', authenticate, changePasswordController);
router.get('/session', authenticate, (_req, res) => res.json({ active: true }));

export default router;
