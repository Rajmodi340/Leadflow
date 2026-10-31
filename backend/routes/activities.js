const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const {
  createActivityValidator,
  updateActivityValidator,
  activityQueryValidator,
} = require('../validators/activityValidator');

router.use(protect);

router.get('/', activityQueryValidator, getActivities);
router.post('/', createActivityValidator, createActivity);
router.patch('/:id', updateActivityValidator, updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
