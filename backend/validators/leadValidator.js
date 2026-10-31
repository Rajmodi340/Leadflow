const { body, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');
const { STAGES, SOURCES } = require('../models/Lead');

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

const createLeadValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 150 }).withMessage('Name must not exceed 150 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Company must not exceed 150 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Please enter a valid phone number'),

  body('budget')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Budget cannot be negative')
    .toFloat(),

  body('stage')
    .optional()
    .isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),

  body('source')
    .optional({ checkFalsy: true })
    .isIn(SOURCES).withMessage(`Source must be one of: ${SOURCES.join(', ')}`),

  body('serviceInterest')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Service interest must not exceed 200 characters'),

  // Custom: at least email or phone
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('At least one of email or phone is required');
    }
    return true;
  }),

  handleValidationErrors,
];

const updateLeadValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 150 }).withMessage('Name must not exceed 150 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Company must not exceed 150 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Please enter a valid phone number'),

  body('budget')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Budget cannot be negative')
    .toFloat(),

  body('stage')
    .optional()
    .isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),

  body('source')
    .optional({ checkFalsy: true })
    .isIn(SOURCES).withMessage(`Source must be one of: ${SOURCES.join(', ')}`),

  body('serviceInterest')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Service interest must not exceed 200 characters'),

  // Prevent mass assignment by stripping non-allowed fields
  body('createdBy').not().exists().withMessage('createdBy cannot be modified'),

  handleValidationErrors,
];

const leadQueryValidator = [
  query('stage')
    .optional()
    .isIn([...STAGES, '']).withMessage(`Stage filter must be one of: ${STAGES.join(', ')}`),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),

  handleValidationErrors,
];

module.exports = { createLeadValidator, updateLeadValidator, leadQueryValidator };
