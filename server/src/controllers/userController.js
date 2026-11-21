const User = require('../models/User');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all application users
 * @route   GET /api/users
 * @access  Admin & Manager
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new application user
 * @route   POST /api/users
 * @access  Admin only
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Name, Email, Password, and Role are required.'
      });
    }

    // Password policy validation (min 8 chars, uppercase, lowercase, digit, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        status: 409,
        title: 'Conflict',
        detail: `A user with email '${email}' already exists.`
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'User',
      recordId: newUser._id,
      newValue: { name: newUser.name, email: newUser.email, role: newUser.role, isActive: newUser.isActive },
      ipAddress: clientIp,
      details: `User ${newUser.email} created with role '${newUser.role}'.`
    });

    res.status(201).json({
      status: 201,
      message: 'User created successfully.',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile & role
 * @route   PUT /api/users/:id
 * @access  Admin only
 */
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'User not found.'
      });
    }

    const { name, email, role, isActive, resetLockout, newPassword } = req.body;

    const oldSnapshot = { name: user.name, email: user.email, role: user.role, isActive: user.isActive };

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (resetLockout) {
      user.failedLoginCount = 0;
      user.lockoutEnd = null;
    }

    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          status: 400,
          title: 'Validation Error',
          detail: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
        });
      }
      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'User',
      recordId: user._id,
      oldValue: oldSnapshot,
      newValue: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      ipAddress: clientIp,
      details: `User ${user.email} updated by Admin.`
    });

    res.status(200).json({
      status: 200,
      message: 'User updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
