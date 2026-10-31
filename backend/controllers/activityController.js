const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const { sendSuccess, sendError } = require('../utils/response');

const ALLOWED_FIELDS = ['title', 'dueAt', 'type', 'status', 'notes'];

const pickAllowed = (obj) => {
  return ALLOWED_FIELDS.reduce((acc, field) => {
    if (obj[field] !== undefined) acc[field] = obj[field];
    return acc;
  }, {});
};

// @desc    Get activities (optionally filter by status or leadId)
// @route   GET /api/v1/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { status, leadId } = req.query;
    const query = { createdBy: req.user._id };

    if (status) query.status = status;
    if (leadId) {
      if (!mongoose.isValidObjectId(leadId)) {
        return sendError(res, 400, 'Invalid lead ID', []);
      }
      query.leadId = leadId;
    }

    const activities = await Activity.find(query)
      .populate('leadId', 'name company')
      .sort({ dueAt: 1 });

    return sendSuccess(res, 200, 'Activities retrieved', { activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Create activity
// @route   POST /api/v1/activities
// @access  Private
const createActivity = async (req, res, next) => {
  try {
    const { leadId, title, dueAt, type, notes } = req.body;

    // Verify lead exists and belongs to user
    const lead = await Lead.findOne({
      _id: leadId,
      createdBy: req.user._id,
    });

    if (!lead) {
      return sendError(res, 404, 'Lead not found or access denied', []);
    }

    const activity = await Activity.create({
      leadId,
      title,
      dueAt,
      type,
      notes,
      createdBy: req.user._id,
    });

    const populated = await activity.populate('leadId', 'name company');

    return sendSuccess(res, 201, 'Activity created', { activity: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity (includes marking complete)
// @route   PATCH /api/v1/activities/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid activity ID', []);
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!activity) {
      return sendError(res, 404, 'Activity not found or access denied', []);
    }

    const data = pickAllowed(req.body);

    // If marking complete, set completedAt
    if (data.status === 'Completed' && activity.status !== 'Completed') {
      data.completedAt = new Date();
    }
    // If marking back to pending, clear completedAt
    if (data.status === 'Pending') {
      data.completedAt = null;
    }

    Object.assign(activity, data);
    await activity.save();
    await activity.populate('leadId', 'name company');

    return sendSuccess(res, 200, 'Activity updated', { activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/v1/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid activity ID', []);
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!activity) {
      return sendError(res, 404, 'Activity not found or access denied', []);
    }

    await activity.deleteOne();
    return sendSuccess(res, 200, 'Activity deleted', {});
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities, createActivity, updateActivity, deleteActivity };
