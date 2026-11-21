const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const { getScopeFilter } = require('../middlewares/rbac');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all leads with search, filter, and pagination
 * @route   GET /api/leads
 * @access  Authorized
 */
exports.getLeads = async (req, res, next) => {
  try {
    const { search, status, source, priority, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');
    const query = { ...baseFilter };

    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { leadCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email role')
        .populate('convertedCustomerId', 'customerCode customerName')
        .populate('convertedOpportunityId', 'opportunityName amount stage')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: leads,
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
 * @desc    Get single lead by ID
 * @route   GET /api/leads/:id
 * @access  Authorized
 */
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('convertedCustomerId')
      .populate('convertedOpportunityId');

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Lead record not found.'
      });
    }

    if (req.user.role === 'SalesExecutive') {
      const isAssigned = lead.assignedTo && lead.assignedTo._id.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to view this lead.'
        });
      }
    }

    res.status(200).json({
      status: 200,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Authorized
 */
exports.createLead = async (req, res, next) => {
  try {
    const { leadName, email, phone, companyName, source, status, priority, expectedValue, notes, assignedTo } = req.body;

    if (!leadName || !email || !phone || !source) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Lead Name, Email, Phone, and Source are required.'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Enter a valid email address.'
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Enter a valid phone number.'
      });
    }

    if (expectedValue !== undefined && expectedValue < 0) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Expected value cannot be negative.'
      });
    }

    const count = await Lead.countDocuments();
    const leadCode = `LEAD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newLead = await Lead.create({
      leadCode,
      leadName: leadName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      companyName: companyName ? companyName.trim() : '',
      source: source.trim(),
      status: status || 'New',
      priority: priority || 'Medium',
      expectedValue: expectedValue || 0,
      notes: notes ? notes.trim() : '',
      assignedTo: assignedTo || req.user._id
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'Lead',
      recordId: newLead._id,
      newValue: newLead.toObject(),
      ipAddress: clientIp,
      details: `Lead ${newLead.leadName} (${newLead.leadCode}) created.`
    });

    res.status(201).json({
      status: 201,
      message: 'Lead created successfully.',
      data: newLead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update lead
 * @route   PUT /api/leads/:id
 * @access  Authorized
 */
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Lead record not found.'
      });
    }

    if (req.user.role === 'SalesExecutive') {
      const isAssigned = lead.assignedTo && lead.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to modify this lead.'
        });
      }
    }

    const { leadName, email, phone, companyName, source, status, priority, expectedValue, notes, assignedTo } = req.body;

    const oldSnapshot = lead.toObject();

    if (leadName) lead.leadName = leadName.trim();
    if (email) lead.email = email.toLowerCase().trim();
    if (phone) lead.phone = phone.trim();
    if (companyName !== undefined) lead.companyName = companyName.trim();
    if (source) lead.source = source.trim();
    if (status) lead.status = status;
    if (priority) lead.priority = priority;
    if (expectedValue !== undefined) lead.expectedValue = expectedValue;
    if (notes !== undefined) lead.notes = notes.trim();
    if (assignedTo && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
      lead.assignedTo = assignedTo;
    }

    await lead.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'Lead',
      recordId: lead._id,
      oldValue: oldSnapshot,
      newValue: lead.toObject(),
      ipAddress: clientIp,
      details: `Lead ${lead.leadCode} updated.`
    });

    res.status(200).json({
      status: 200,
      message: 'Lead updated successfully.',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Convert Qualified Lead to Customer & Opportunity (Atomic Workflow)
 * @route   POST /api/leads/:id/convert
 * @access  Authorized
 */
exports.convertLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Lead record not found.'
      });
    }

    if (lead.status === 'Converted') {
      return res.status(409).json({
        status: 409,
        title: 'Conflict',
        detail: 'This lead has already been converted into a customer and opportunity.'
      });
    }

    const { opportunityName, amount, expectedCloseDate } = req.body;

    // 1. Check or Create Customer
    let customer = await Customer.findOne({
      $or: [
        { email: lead.email },
        { phone: lead.phone }
      ],
      isDeleted: { $ne: true }
    });

    if (!customer) {
      const custCount = await Customer.countDocuments();
      const customerCode = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(4, '0')}`;
      customer = await Customer.create({
        customerCode,
        customerName: lead.leadName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName || '',
        status: 'Active',
        assignedTo: lead.assignedTo || req.user._id,
        createdBy: req.user._id
      });
    }

    // 2. Create Opportunity
    const oppAmount = amount || (lead.expectedValue > 0 ? lead.expectedValue : 10000);
    const closeDate = expectedCloseDate ? new Date(expectedCloseDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const opportunity = await Opportunity.create({
      opportunityName: opportunityName || `${lead.companyName || lead.leadName} - Deal`,
      customerId: customer._id,
      leadId: lead._id,
      amount: oppAmount,
      stage: 'Qualification',
      probability: 20,
      expectedCloseDate: closeDate,
      status: 'Open',
      source: lead.source,
      notes: `Converted from Lead ${lead.leadCode}. ${lead.notes || ''}`,
      assignedTo: lead.assignedTo || req.user._id
    });

    // 3. Mark Lead as Converted
    lead.status = 'Converted';
    lead.convertedCustomerId = customer._id;
    lead.convertedOpportunityId = opportunity._id;
    await lead.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'Lead',
      recordId: lead._id,
      details: `Lead ${lead.leadCode} converted into Customer ${customer.customerCode} and Opportunity ${opportunity._id}.`,
      ipAddress: clientIp
    });

    res.status(200).json({
      status: 200,
      message: 'Lead converted successfully.',
      data: {
        leadId: lead._id,
        customerId: customer._id,
        customerCode: customer.customerCode,
        opportunityId: opportunity._id,
        opportunityName: opportunity.opportunityName
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete lead
 * @route   DELETE /api/leads/:id
 * @access  Admin only
 */
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Lead record not found.'
      });
    }

    lead.isDeleted = true;
    await lead.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Delete',
      entityName: 'Lead',
      recordId: lead._id,
      ipAddress: clientIp,
      details: `Lead ${lead.leadCode} deleted.`
    });

    res.status(200).json({
      status: 200,
      message: 'Lead deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
