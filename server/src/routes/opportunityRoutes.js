const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(protect);

router.route('/')
  .get(getOpportunities)
  .post(createOpportunity);

router.route('/:id')
  .get(getOpportunityById)
  .put(updateOpportunity)
  .delete(authorize('Admin'), deleteOpportunity);

module.exports = router;
