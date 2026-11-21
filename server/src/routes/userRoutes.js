const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager'), getUsers)
  .post(authorize('Admin'), createUser);

router.route('/:id')
  .put(authorize('Admin'), updateUser);

module.exports = router;
