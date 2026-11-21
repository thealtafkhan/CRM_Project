const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const { getScopeFilter } = require('../middlewares/rbac');
const { logAuditEvent } = require('../services/auditService');

/**
 * @desc    Get all customers with search, filter, and pagination
 * @route   GET /api/customers
 * @access  Authorized
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');
    const query = { ...baseFilter };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Customer.countDocuments(query)
    ]);

    res.status(200).json({
      status: 200,
      data: customers,
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
 * @desc    Get single customer by ID with full 360 history
 * @route   GET /api/customers/:id
 * @access  Authorized
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Customer record not found.'
      });
    }

    // Role Ownership check
    if (req.user.role === 'SalesExecutive') {
      const isAssigned = customer.assignedTo && customer.assignedTo._id.toString() === req.user._id.toString();
      const isCreator = customer.createdBy && customer.createdBy._id.toString() === req.user._id.toString();
      if (!isAssigned && !isCreator) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to view this customer record.'
        });
      }
    }

    // Fetch related records for Customer 360 view
    const [opportunities, followUps, activities] = await Promise.all([
      Opportunity.find({ customerId: customer._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 }),
      FollowUp.find({ customerId: customer._id }).sort({ followUpDate: 1 }),
      Activity.find({ customerId: customer._id }).sort({ activityDate: -1 })
    ]);

    res.status(200).json({
      status: 200,
      data: {
        ...customer.toObject(),
        opportunities,
        followUps,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Authorized
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { customerName, email, phone, companyName, address, city, state, status, assignedTo } = req.body;

    if (!customerName || !email || !phone) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Customer Name, Email, and Phone number are required.'
      });
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Enter a valid email address.'
      });
    }

    // Phone format validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        detail: 'Enter a valid phone number.'
      });
    }

    // Uniqueness checks (Email & Phone)
    const [existingEmail, existingPhone] = await Promise.all([
      Customer.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } }),
      Customer.findOne({ phone: phone.trim(), isDeleted: { $ne: true } })
    ]);

    if (existingEmail) {
      return res.status(409).json({
        status: 409,
        title: 'Conflict',
        detail: `A customer with email '${email}' already exists.`
      });
    }

    if (existingPhone) {
      return res.status(409).json({
        status: 409,
        title: 'Conflict',
        detail: `A customer with phone '${phone}' already exists.`
      });
    }

    // Auto-generate CustomerCode (e.g. CUST-2026-XXXX)
    const count = await Customer.countDocuments();
    const customerCode = `CUST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newCustomer = await Customer.create({
      customerCode,
      customerName: customerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      companyName: companyName ? companyName.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      status: status || 'Active',
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Create',
      entityName: 'Customer',
      recordId: newCustomer._id,
      newValue: newCustomer.toObject(),
      ipAddress: clientIp,
      details: `Customer ${newCustomer.customerName} (${newCustomer.customerCode}) created.`
    });

    res.status(201).json({
      status: 201,
      message: 'Customer created successfully.',
      data: newCustomer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Authorized
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Customer record not found.'
      });
    }

    // Ownership check for SalesExecutive
    if (req.user.role === 'SalesExecutive') {
      const isAssigned = customer.assignedTo && customer.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          status: 403,
          title: 'Forbidden',
          detail: 'You do not have permission to modify this customer.'
        });
      }
    }

    const { customerName, email, phone, companyName, address, city, state, status, assignedTo } = req.body;

    // Check duplicate email if changed
    if (email && email.toLowerCase().trim() !== customer.email) {
      const duplicateEmail = await Customer.findOne({
        _id: { $ne: customer._id },
        email: email.toLowerCase().trim(),
        isDeleted: { $ne: true }
      });
      if (duplicateEmail) {
        return res.status(409).json({
          status: 409,
          title: 'Conflict',
          detail: `A customer with email '${email}' already exists.`
        });
      }
    }

    // Check duplicate phone if changed
    if (phone && phone.trim() !== customer.phone) {
      const duplicatePhone = await Customer.findOne({
        _id: { $ne: customer._id },
        phone: phone.trim(),
        isDeleted: { $ne: true }
      });
      if (duplicatePhone) {
        return res.status(409).json({
          status: 409,
          title: 'Conflict',
          detail: `A customer with phone '${phone}' already exists.`
        });
      }
    }

    const oldSnapshot = customer.toObject();

    if (customerName) customer.customerName = customerName.trim();
    if (email) customer.email = email.toLowerCase().trim();
    if (phone) customer.phone = phone.trim();
    if (companyName !== undefined) customer.companyName = companyName.trim();
    if (address !== undefined) customer.address = address.trim();
    if (city !== undefined) customer.city = city.trim();
    if (state !== undefined) customer.state = state.trim();
    if (status) customer.status = status;
    if (assignedTo && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
      customer.assignedTo = assignedTo;
    }

    await customer.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Update',
      entityName: 'Customer',
      recordId: customer._id,
      oldValue: oldSnapshot,
      newValue: customer.toObject(),
      ipAddress: clientIp,
      details: `Customer ${customer.customerCode} updated.`
    });

    res.status(200).json({
      status: 200,
      message: 'Customer updated successfully.',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate/Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Admin & Manager only
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        detail: 'Customer record not found.'
      });
    }

    const oldSnapshot = customer.toObject();
    customer.status = 'Inactive';
    customer.isDeleted = true;
    await customer.save();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await logAuditEvent({
      userId: req.user._id,
      action: 'Delete',
      entityName: 'Customer',
      recordId: customer._id,
      oldValue: oldSnapshot,
      newValue: customer.toObject(),
      ipAddress: clientIp,
      details: `Customer ${customer.customerCode} deactivated.`
    });

    res.status(200).json({
      status: 200,
      message: 'Customer deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
