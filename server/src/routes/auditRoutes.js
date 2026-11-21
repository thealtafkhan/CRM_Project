const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(protect);
router.get('/', authorize('Admin', 'Manager'), getAuditLogs);

module.exports = router;
