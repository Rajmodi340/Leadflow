const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { sendSuccess, sendError } = require('../utils/response');

// Allowlisted fields for create/update
const ALLOWED_FIELDS = ['name', 'company', 'email', 'phone', 'serviceInterest', 'source', 'budget', 'stage'];

const pickAllowed = (obj) => {
  return ALLOWED_FIELDS.reduce((acc, field) => {
    if (obj[field] !== undefined) acc[field] = obj[field];
    return acc;
  }, {});
};

// @desc    Get all leads (with search + filter)
// @route   GET /api/v1/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const { search, stage, page = 1, limit = 20 } = req.query;
    const query = { createdBy: req.user._id };

    if (stage) query.stage = stage;

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: searchRegex }, { company: searchRegex }];
    }

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Leads retrieved', {
      leads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
const getLead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid lead ID', []);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!lead) {
      return sendError(res, 404, 'Lead not found', []);
    }

    return sendSuccess(res, 200, 'Lead retrieved', { lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lead
// @route   POST /api/v1/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const data = pickAllowed(req.body);
    data.createdBy = req.user._id;

    const lead = await Lead.create(data);
    return sendSuccess(res, 201, 'Lead created successfully', { lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PATCH /api/v1/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid lead ID', []);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!lead) {
      return sendError(res, 404, 'Lead not found or access denied', []);
    }

    const data = pickAllowed(req.body);
    Object.assign(lead, data);
    await lead.save();

    return sendSuccess(res, 200, 'Lead updated successfully', { lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead (and its activities)
// @route   DELETE /api/v1/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid lead ID', []);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!lead) {
      return sendError(res, 404, 'Lead not found or access denied', []);
    }

    // Delete associated activities
    await Activity.deleteMany({ leadId: lead._id });
    await lead.deleteOne();

    return sendSuccess(res, 200, 'Lead and associated activities deleted', {});
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead };
