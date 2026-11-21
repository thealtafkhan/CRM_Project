const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  convertLead,
  deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize('Admin'), deleteLead);

router.post('/:id/convert', convertLead);

module.exports = router;
