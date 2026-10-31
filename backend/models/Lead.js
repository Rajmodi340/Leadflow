const mongoose = require('mongoose');

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Email', 'Event', 'Other'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [150, 'Name must not exceed 150 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [150, 'Company name must not exceed 150 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\+\-\(\)]{7,20}$/, 'Please enter a valid phone number'],
    },
    serviceInterest: {
      type: String,
      trim: true,
      maxlength: [200, 'Service interest must not exceed 200 characters'],
    },
    source: {
      type: String,
      enum: {
        values: SOURCES,
        message: `Source must be one of: ${SOURCES.join(', ')}`,
      },
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    stage: {
      type: String,
      enum: {
        values: STAGES,
        message: `Stage must be one of: ${STAGES.join(', ')}`,
      },
      default: 'New',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Validate at least email OR phone is provided
leadSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'At least one of email or phone is required');
  }
  next();
});

// Index for search performance
leadSchema.index({ name: 'text', company: 'text' });
leadSchema.index({ createdBy: 1, stage: 1 });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.STAGES = STAGES;
module.exports.SOURCES = SOURCES;
