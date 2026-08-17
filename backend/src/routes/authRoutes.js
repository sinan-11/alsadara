const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', otpLimiter, resendVerification);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
