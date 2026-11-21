const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Check Cookie
  else if (req.cookies && req.cookies['.AcxiomCRM.Auth']) {
    token = req.cookies['.AcxiomCRM.Auth'];
  }

  if (!token) {
    return res.status(401).json({
      status: 401,
      title: 'Unauthorized',
      detail: 'Authentication token required to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'AcxiomCRM_Super_Secret_Key_Production_Grade_Security_2026!');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 401,
        title: 'Unauthorized',
        detail: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 403,
        title: 'Forbidden',
        detail: 'This user account has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      title: 'Unauthorized',
      detail: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = { protect };
