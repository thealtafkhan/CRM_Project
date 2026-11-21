const Opportunity = require('../models/Opportunity');
const { getScopeFilter } = require('../middlewares/rbac');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all opportunities with search, filter, and pagination
 * @route   GET /api/opportunities
 * @access  Authorized
 */
exports.getOpportunities = async (req, res, next) => {
  try {
    const { search, stage, status, customerId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');
    const query = { ...baseFilter };

    if (stage) query.stage = stage;
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    if (search) {
      query.$or = [
        { opportunityName: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate('customerId', 'customerCode customerName email phone')
        .populate('leadId', 'leadCode leadName')
        .populate('assignedTo', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Opportunity.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: opportunities,
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
 * @desc    Get single opportunity by ID
 * @route   GET /api/opportunities/:id
 * @access  Authorized
 */
exports.getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('customerId')
      .populate('leadId')
      .populate('assignedTo', 'name email role');

    if (!opportunity || opportunity.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Opportunity record not found.'
      });
    }

    if (req.user.role === 'SalesExecutive') {
      const isAssigned = opportunity.assignedTo && opportunity.assignedTo._id.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to view this opportunity.'
        });
      }
    }

    res.status(200).json({
      status: 200,
      data: opportunity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new opportunity
 * @route   POST /api/opportunities
 * @access  Authorized
 */
exports.createOpportunity = async (req, res, next) => {
  try {
    const {
      opportunityName,
      customerId,
      leadId,
      amount,
      stage,
      probability,
      expectedCloseDate,
      source,
      notes,
      assignedTo
    } = req.body;

    if (!opportunityName || !customerId || amount === undefined || !expectedCloseDate) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Opportunity Name, Customer, Amount, and Expected Close Date are required.'
      });
    }

    // Amount validation (Mandatory from PDF: Amount > 0 for active sales opportunities)
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Opportunity Amount must be greater than 0.'
      });
    }

    // Probability validation (0 to 100)
    const numProb = Number(probability !== undefined ? probability : 10);
    if (isNaN(numProb) || numProb < 0 || numProb > 100) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Probability must be between 0 and 100.'
      });
    }

    // Date validation (Expected Close Date cannot be in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closeDate = new Date(expectedCloseDate);
    if (closeDate < today) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Expected Close Date cannot be in the past.'
      });
    }

    const newOpportunity = await Opportunity.create({
      opportunityName: opportunityName.trim(),
      customerId,
      leadId: leadId || null,
      amount: numAmount,
      stage: stage || 'Qualification',
      probability: numProb,
      expectedCloseDate: closeDate,
      status: 'Open',
      source: source ? source.trim() : '',
      notes: notes ? notes.trim() : '',
      assignedTo: assignedTo || req.user._id
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'Opportunity',
      recordId: newOpportunity._id,
      newValue: newOpportunity.toObject(),
      ipAddress: clientIp,
      details: `Opportunity ${newOpportunity.opportunityName} (Amount: $${newOpportunity.amount}) created.`
    });

    res.status(201).json({
      status: 201,
      message: 'Opportunity created successfully.',
      data: newOpportunity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update opportunity
 * @route   PUT /api/opportunities/:id
 * @access  Authorized
 */
exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity || opportunity.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Opportunity record not found.'
      });
    }

    if (req.user.role === 'SalesExecutive') {
      const isAssigned = opportunity.assignedTo && opportunity.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to modify this opportunity.'
        });
      }
    }

    const {
      opportunityName,
      amount,
      stage,
      probability,
      expectedCloseDate,
      source,
      notes,
      assignedTo
    } = req.body;

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          status: 400,
          title: 'Validation Error',
          detail: 'Opportunity Amount must be greater than 0.'
        });
      }
      opportunity.amount = numAmount;
    }

    if (probability !== undefined) {
      const numProb = Number(probability);
      if (isNaN(numProb) || numProb < 0 || numProb > 100) {
        return res.status(400).json({
          status: 400,
          title: 'Validation Error',
          detail: 'Probability must be between 0 and 100.'
        });
      }
      opportunity.probability = numProb;
    }

    if (expectedCloseDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const closeDate = new Date(expectedCloseDate);
      if (closeDate < today && opportunity.status === 'Open') {
        return res.status(400).json({
          status: 400,
          title: 'Validation Error',
          detail: 'Expected Close Date cannot be in the past.'
        });
      }
      opportunity.expectedCloseDate = closeDate;
    }

    const oldSnapshot = opportunity.toObject();

    if (opportunityName) opportunity.opportunityName = opportunityName.trim();
    if (stage) opportunity.stage = stage;
    if (source !== undefined) opportunity.source = source.trim();
    if (notes !== undefined) opportunity.notes = notes.trim();
    if (assignedTo && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
      opportunity.assignedTo = assignedTo;
    }

    await opportunity.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'Opportunity',
      recordId: opportunity._id,
      oldValue: oldSnapshot,
      newValue: opportunity.toObject(),
      ipAddress: clientIp,
      details: `Opportunity ${opportunity.opportunityName} updated (Stage: ${opportunity.stage}).`
    });

    res.status(200).json({
      status: 200,
      message: 'Opportunity updated successfully.',
      data: opportunity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete opportunity
 * @route   DELETE /api/opportunities/:id
 * @access  Admin only
 */
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity || opportunity.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Opportunity record not found.'
      });
    }

    opportunity.isDeleted = true;
    await opportunity.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Delete',
      entityName: 'Opportunity',
      recordId: opportunity._id,
      ipAddress: clientIp,
      details: `Opportunity ${opportunity.opportunityName} deleted.`
    });

    res.status(200).json({
      status: 200,
      message: 'Opportunity deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
