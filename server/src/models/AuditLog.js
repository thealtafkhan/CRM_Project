const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: ['Login', 'FailedLogin', 'Logout', 'Create', 'Update', 'Delete', 'RoleChange', 'Security', 'Lockout']
  },
  entityName: {
    type: String,
    required: true
  },
  recordId: {
    type: String,
    default: null
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  details: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Immutable: only createdAt, no updatedAt
});

// Guardrail: Block update or delete on audit log collection to guarantee immutability
auditLogSchema.pre('updateOne', function() {
  throw new Error('AuditLog records are append-only and cannot be updated.');
});
auditLogSchema.pre('updateMany', function() {
  throw new Error('AuditLog records are append-only and cannot be updated.');
});
auditLogSchema.pre('deleteOne', function() {
  throw new Error('AuditLog records are append-only and cannot be deleted.');
});
auditLogSchema.pre('deleteMany', function() {
  throw new Error('AuditLog records are append-only and cannot be deleted.');
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1, entityName: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
