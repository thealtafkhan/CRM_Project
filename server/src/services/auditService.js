const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event into the append-only AuditLog collection
 */
const logAuditEvent = async ({ userId, action, entityName, recordId, oldValue, newValue, ipAddress, details }) => {
  try {
    await AuditLog.create({
      userId: userId || null,
      action,
      entityName,
      recordId: recordId ? recordId.toString() : null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || null,
      details: details || null
    });
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
};

module.exports = {
  logAuditEvent
};
