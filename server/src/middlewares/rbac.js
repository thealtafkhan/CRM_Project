/**
 * Restrict endpoint access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        title: 'Unauthorized',
        detail: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        title: 'Forbidden',
        detail: `User role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

/**
 * Build Mongoose query filter based on user role
 * - Admin: sees everything
 * - Manager: sees team/all CRM data (management scope)
 * - SalesExecutive: strictly sees only assigned records or records created by them
 */
const getScopeFilter = (user, assignedField = 'assignedTo') => {
  if (!user) return { _id: null }; // deny all
  if (user.role === 'Admin' || user.role === 'Manager') {
    return { isDeleted: { $ne: true } };
  }
  // SalesExecutive
  return {
    isDeleted: { $ne: true },
    $or: [
      { [assignedField]: user._id },
      { createdBy: user._id }
    ]
  };
};

module.exports = {
  authorize,
  getScopeFilter
};
