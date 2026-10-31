const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { sendSuccess } = require('../utils/response');

// @desc    Get dashboard summary from real MongoDB data
// @route   GET /api/v1/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      pendingFollowUps,
      overdueFollowUps,
      recentLeads,
      stageDistribution,
    ] = await Promise.all([
      // Total leads
      Lead.countDocuments({ createdBy: userId }),

      // Active leads (not Won or Lost)
      Lead.countDocuments({
        createdBy: userId,
        stage: { $nin: ['Won', 'Lost'] },
      }),

      // Won leads
      Lead.countDocuments({ createdBy: userId, stage: 'Won' }),

      // Lost leads
      Lead.countDocuments({ createdBy: userId, stage: 'Lost' }),

      // Pending follow-ups
      Activity.countDocuments({ createdBy: userId, status: 'Pending' }),

      // Overdue follow-ups (pending and due date is past)
      Activity.countDocuments({
        createdBy: userId,
        status: 'Pending',
        dueAt: { $lt: now },
      }),

      // Recent 5 leads
      Lead.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name company stage createdAt'),

      // Stage distribution
      Lead.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Dashboard summary retrieved', {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      pendingFollowUps,
      overdueFollowUps,
      recentLeads,
      stageDistribution,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
