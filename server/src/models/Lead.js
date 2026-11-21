const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  leadName: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    maxlength: [150, 'Lead name cannot exceed 150 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number']
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [150, 'Company name cannot exceed 150 characters']
  },
  source: {
    type: String,
    required: [true, 'Lead source is required'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
      message: 'Status must be New, Contacted, Qualified, Unqualified, Converted, or Lost'
    },
    default: 'New',
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    required: true
  },
  expectedValue: {
    type: Number,
    required: [true, 'Expected value is required'],
    min: [0, 'Expected value cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  convertedCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  convertedOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

leadSchema.index({ leadName: 'text', companyName: 'text', email: 'text', phone: 'text' });
leadSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Lead', leadSchema);
