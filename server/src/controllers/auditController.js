const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get audit trail logs with filtering
 * @route   GET /api/audit
 * @access  Admin only (or Manager with limited view)
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityName, userId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (action) query.action = action;
    if (entityName) query.entityName = entityName;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};
