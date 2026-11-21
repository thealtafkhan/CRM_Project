const express = require('express');
const router = express.Router();
const { getDashboardSummary, getPipelineReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/pipeline', getPipelineReport);

module.exports = router;
