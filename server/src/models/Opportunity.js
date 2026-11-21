const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  opportunityName: {
    type: String,
    required: [true, 'Opportunity name is required'],
    trim: true,
    maxlength: [200, 'Opportunity name cannot exceed 200 characters']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Associated Customer is required']
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Opportunity amount is required'],
    validate: {
      validator: function(val) {
        // If active (Open), amount must be greater than 0
        if (this.status === 'Open' || !this.status) {
          return val > 0;
        }
        return val >= 0;
      },
      message: 'Opportunity Amount must be greater than 0.'
    }
  },
  stage: {
    type: String,
    enum: {
      values: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      message: 'Stage must be Qualification, Proposal, Negotiation, Won, or Lost'
    },
    default: 'Qualification',
    required: true
  },
  probability: {
    type: Number,
    required: [true, 'Probability is required'],
    min: [0, 'Probability must be between 0 and 100.'],
    max: [100, 'Probability must be between 0 and 100.'],
    default: 10
  },
  expectedCloseDate: {
    type: Date,
    required: [true, 'Expected close date is required'],
    validate: {
      validator: function(val) {
        // Active opportunities cannot have a close date in the past
        if (this.status === 'Open' || !this.status) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(val) >= today;
        }
        return true;
      },
      message: 'Expected Close Date cannot be in the past.'
    }
  },
  status: {
    type: String,
    enum: ['Open', 'Won', 'Lost'],
    default: 'Open',
    required: true
  },
  source: {
    type: String,
    trim: true
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
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to calculate weighted pipeline value = (Amount * Probability) / 100
opportunitySchema.virtual('weightedAmount').get(function() {
  return (this.amount * this.probability) / 100;
});

// Auto-sync status with stage
opportunitySchema.pre('save', function(next) {
  if (this.stage === 'Won') {
    this.status = 'Won';
    this.probability = 100;
  } else if (this.stage === 'Lost') {
    this.status = 'Lost';
    this.probability = 0;
  } else {
    this.status = 'Open';
  }
  next();
});

opportunitySchema.index({ opportunityName: 'text' });
opportunitySchema.index({ assignedTo: 1, stage: 1, status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
