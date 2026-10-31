const mongoose = require('mongoose');

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task'];
const ACTIVITY_STATUSES = ['Pending', 'Completed'];

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    dueAt: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    type: {
      type: String,
      enum: {
        values: ACTIVITY_TYPES,
        message: `Type must be one of: ${ACTIVITY_TYPES.join(', ')}`,
      },
      required: [true, 'Activity type is required'],
    },
    status: {
      type: String,
      enum: {
        values: ACTIVITY_STATUSES,
        message: `Status must be one of: ${ACTIVITY_STATUSES.join(', ')}`,
      },
      default: 'Pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must not exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

activitySchema.index({ leadId: 1, status: 1 });
activitySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Activity', activitySchema);
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
module.exports.ACTIVITY_STATUSES = ACTIVITY_STATUSES;
