const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAuditEvent } = require('../services/auditService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'AcxiomCRM_Super_Secret_Key_Production_Grade_Security_2026!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Set secure cookie
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
  res.cookie('.AcxiomCRM.Auth', token, cookieOptions);
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public (Rate limited)
 */
exports.login = async (req, res, next) => {
  try {
    const { usernameOrEmail, email, password } = req.body;
    const identifier = usernameOrEmail || email;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        detail: 'Username/Email and Password are required.'
      });
    }

    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { name: identifier.trim() }
      ]
    }).select('+password');

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // If user not found
    if (!user) {
      await logAuditEvent({
        action: 'FailedLogin',
        entityName: 'Authentication',
        recordId: identifier,
        ipAddress: clientIp,
        details: `Failed login attempt for non-existent user: ${identifier}`
      });

      return res.status(401).json({
        status: 401,
        title: 'Unauthorized',
        detail: 'Invalid login credentials.'
      });
    }

    // Check if account is deactivated
    if (!user.isActive) {
      await logAuditEvent({
        userId: user._id,
        action: 'FailedLogin',
        entityName: 'Authentication',
        recordId: user._id,
        ipAddress: clientIp,
        details: 'Login attempt on deactivated account.'
      });

      return res.status(403).json({
        status: 403,
        title: 'Forbidden',
        detail: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Check account lockout
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockoutEnd - new Date()) / (60 * 1000));
      await logAuditEvent({
        userId: user._id,
        action: 'Lockout',
        entityName: 'Authentication',
        recordId: user._id,
        ipAddress: clientIp,
        details: `Login blocked by active lockout. Remaining: ${remainingMinutes} min.`
      });

      return res.status(423).json({
        status: 423,
        title: 'Account Locked',
        detail: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minutes or contact your administrator.`
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;

      // Check if threshold reached (5 failed attempts)
      if (user.failedLoginCount >= 5) {
        user.lockoutEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        await logAuditEvent({
          userId: user._id,
          action: 'Lockout',
          entityName: 'Authentication',
          recordId: user._id,
          ipAddress: clientIp,
          details: 'Account locked for 15 minutes after 5 consecutive failed login attempts.'
        });

        return res.status(423).json({
          status: 423,
          title: 'Account Locked',
          detail: 'Account is locked for 15 minutes due to 5 consecutive failed login attempts.'
        });
      }

      await user.save();

      await logAuditEvent({
        userId: user._id,
        action: 'FailedLogin',
        entityName: 'Authentication',
        recordId: user._id,
        ipAddress: clientIp,
        details: `Invalid password attempt (${user.failedLoginCount}/5).`
      });

      return res.status(401).json({
        status: 401,
        title: 'Unauthorized',
        detail: 'Invalid login credentials.'
      });
    }

    // Successful login: Reset failed counter & lockout
    user.failedLoginCount = 0;
    user.lockoutEnd = null;
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    await logAuditEvent({
      userId: user._id,
      action: 'Login',
      entityName: 'Authentication',
      recordId: user._id,
      ipAddress: clientIp,
      details: `User ${user.email} (${user.role}) logged in successfully.`
    });

    res.status(200).json({
      status: 200,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Authenticated
 */
exports.logout = async (req, res, next) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (req.user) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'Logout',
        entityName: 'Authentication',
        recordId: req.user._id,
        ipAddress: clientIp,
        details: `User ${req.user.email} logged out.`
      });
    }

    res.clearCookie('.AcxiomCRM.Auth');
    res.status(200).json({
      status: 200,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Authenticated
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 200,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
