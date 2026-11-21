const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  updateFollowUp
} = require('../controllers/followUpController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .put(updateFollowUp);

module.exports = router;
