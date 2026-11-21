const FollowUp = require('../models/FollowUp');
const { getScopeFilter } = require('../middlewares/rbac');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all follow-ups with filter and status
 * @route   GET /api/followups
 * @access  Authorized
 */
exports.getFollowUps = async (req, res, next) => {
  try {
    const { status, customerId, leadId, isOverdue, page = 1, limit = 15 } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');
    const query = { ...baseFilter };

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (leadId) query.leadId = leadId;

    if (isOverdue === 'true') {
      query.status = 'Planned';
      query.followUpDate = { $lt: new Date() };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [followUps, total] = await Promise.all([
      FollowUp.find(query)
        .populate('customerId', 'customerCode customerName phone')
        .populate('leadId', 'leadCode leadName phone')
        .populate('opportunityId', 'opportunityName amount')
        .populate('assignedTo', 'name email')
        .sort({ followUpDate: 1 })
        .skip(skip)
        .limit(limitNum),
      FollowUp.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: followUps,
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
 * @desc    Create a new follow-up
 * @route   POST /api/followups
 * @access  Authorized
 */
exports.createFollowUp = async (req, res, next) => {
  try {
    const { customerId, leadId, opportunityId, followUpDate, followUpType, subject, remarks, assignedTo } = req.body;

    if (!followUpDate || !subject) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Follow-up Date and Subject are required.'
      });
    }

    // Anti-backdating validation rule
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(followUpDate);

    if (targetDate < today) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Follow-up date cannot be earlier than today.'
      });
    }

    const newFollowUp = await FollowUp.create({
      customerId: customerId || null,
      leadId: leadId || null,
      opportunityId: opportunityId || null,
      followUpDate: targetDate,
      followUpType: followUpType || 'Call',
      subject: subject.trim(),
      remarks: remarks ? remarks.trim() : '',
      status: 'Planned',
      assignedTo: assignedTo || req.user._id
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'FollowUp',
      recordId: newFollowUp._id,
      newValue: newFollowUp.toObject(),
      ipAddress: clientIp,
      details: `Follow-up '${newFollowUp.subject}' scheduled for ${newFollowUp.followUpDate.toISOString().slice(0, 10)}.`
    });

    res.status(201).json({
      status: 201,
      message: 'Follow-up scheduled successfully.',
      data: newFollowUp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update / Complete / Reschedule follow-up
 * @route   PUT /api/followups/:id
 * @access  Authorized
 */
exports.updateFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Follow-up record not found.'
      });
    }

    const { followUpDate, followUpType, subject, remarks, status, assignedTo } = req.body;

    // Rescheduling check: if updating date and status remains Planned, cannot be past
    if (followUpDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(followUpDate);
      if (targetDate < today && status === 'Planned') {
        return res.status(400).json({
          status: 400,
          title: 'Validation Error',
          detail: 'Follow-up date cannot be earlier than today.'
        });
      }
      followUp.followUpDate = targetDate;
    }

    const oldSnapshot = followUp.toObject();

    if (followUpType) followUp.followUpType = followUpType;
    if (subject) followUp.subject = subject.trim();
    if (remarks !== undefined) followUp.remarks = remarks.trim();
    if (status) followUp.status = status;
    if (assignedTo && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
      followUp.assignedTo = assignedTo;
    }

    await followUp.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'FollowUp',
      recordId: followUp._id,
      oldValue: oldSnapshot,
      newValue: followUp.toObject(),
      ipAddress: clientIp,
      details: `Follow-up ${followUp._id} updated to status '${followUp.status}'.`
    });

    res.status(200).json({
      status: 200,
      message: 'Follow-up updated successfully.',
      data: followUp
    });
  } catch (error) {
    next(error);
  }
};
