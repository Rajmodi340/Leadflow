const { body, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');
const { ACTIVITY_TYPES } = require('../models/Activity');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 400, 'Validation failed', formatted);
  }
  next();
};

const createActivityValidator = [
  body('leadId')
    .notEmpty().withMessage('Lead ID is required')
    .isMongoId().withMessage('Invalid lead ID'),

  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),

  body('dueAt')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date')
    .toDate(),

  body('type')
    .notEmpty().withMessage('Activity type is required')
    .isIn(ACTIVITY_TYPES).withMessage(`Type must be one of: ${ACTIVITY_TYPES.join(', ')}`),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),

  handleValidationErrors,
];

const updateActivityValidator = [
  body('status')
    .optional()
    .isIn(['Pending', 'Completed']).withMessage('Status must be Pending or Completed'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),

  body('dueAt')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date')
    .toDate(),

  body('type')
    .optional()
    .isIn(ACTIVITY_TYPES).withMessage(`Type must be one of: ${ACTIVITY_TYPES.join(', ')}`),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),

  // Prevent changing leadId or createdBy
  body('leadId').not().exists().withMessage('leadId cannot be modified'),
  body('createdBy').not().exists().withMessage('createdBy cannot be modified'),

  handleValidationErrors,
];

const activityQueryValidator = [
  query('status')
    .optional()
    .isIn(['Pending', 'Completed', '']).withMessage('Status must be Pending or Completed'),

  query('leadId')
    .optional()
    .isMongoId().withMessage('Invalid lead ID'),

  handleValidationErrors,
];

module.exports = { createActivityValidator, updateActivityValidator, activityQueryValidator };
