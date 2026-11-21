const Activity = require('../models/Activity');
const { getScopeFilter } = require('../middlewares/rbac');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all activities with filters
 * @route   GET /api/activities
 * @access  Authorized
 */
exports.getActivities = async (req, res, next) => {
  try {
    const { activityType, customerId, leadId, page = 1, limit = 15 } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');
    const query = { ...baseFilter };

    if (activityType) query.activityType = activityType;
    if (customerId) query.customerId = customerId;
    if (leadId) query.leadId = leadId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('customerId', 'customerCode customerName')
        .populate('leadId', 'leadCode leadName')
        .populate('assignedTo', 'name email')
        .sort({ activityDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Activity.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: activities,
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

/**
 * @desc    Log a new activity (Call, Meeting, Email, Task)
 * @route   POST /api/activities
 * @access  Authorized
 */
exports.createActivity = async (req, res, next) => {
  try {
    const { activityType, subject, description, activityDate, customerId, leadId, assignedTo } = req.body;

    if (!activityType || !subject) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Activity Type and Subject are required.'
      });
    }

    const newActivity = await Activity.create({
      activityType,
      subject: subject.trim(),
      description: description ? description.trim() : '',
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      customerId: customerId || null,
      leadId: leadId || null,
      assignedTo: assignedTo || req.user._id,
      status: 'Completed'
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'Activity',
      recordId: newActivity._id,
      newValue: newActivity.toObject(),
      ipAddress: clientIp,
      details: `Activity ${newActivity.activityType}: ${newActivity.subject} logged.`
    });

    res.status(201).json({
      status: 201,
      message: 'Activity logged successfully.',
      data: newActivity
    });
  } catch (error) {
    next(error);
  }
};
