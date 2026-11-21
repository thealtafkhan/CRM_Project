const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Brute-force rate limiter on login endpoint: max 10 requests per minute
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 429,
    title: 'Too Many Requests',
    detail: 'Too many authentication attempts from this IP. Please try again after 60 seconds.'
  }
});

router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
