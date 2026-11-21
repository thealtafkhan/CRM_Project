const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: {
      values: ['Call', 'Meeting', 'Email', 'Task'],
      message: 'Activity type must be Call, Meeting, Email, or Task'
    },
    required: [true, 'Activity type is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  activityDate: {
    type: Date,
    required: [true, 'Activity date is required'],
    default: Date.now
  },
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Completed'
  }
}, {
  timestamps: true
});

activitySchema.index({ assignedTo: 1, activityDate: -1 });
activitySchema.index({ customerId: 1, leadId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
