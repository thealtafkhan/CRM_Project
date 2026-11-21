const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  followUpDate: {
    type: Date,
    required: [true, 'Follow-up date is required'],
    validate: {
      validator: function(val) {
        // Only validate if new or planned
        if (this.isNew || this.status === 'Planned') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(val) >= today;
        }
        return true;
      },
      message: 'Follow-up date cannot be earlier than today.'
    }
  },
  followUpType: {
    type: String,
    enum: {
      values: ['Call', 'Meeting', 'VideoConference', 'Email'],
      message: 'Type must be Call, Meeting, VideoConference, or Email'
    },
    default: 'Call',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  remarks: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['Planned', 'Completed', 'Missed', 'Cancelled'],
      message: 'Status must be Planned, Completed, Missed, or Cancelled'
    },
    default: 'Planned',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to determine if follow-up is overdue
followUpSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Planned' && this.followUpDate < new Date()) {
    return true;
  }
  return false;
});

followUpSchema.index({ assignedTo: 1, followUpDate: 1, status: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
