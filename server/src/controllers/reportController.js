const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { getScopeFilter } = require('../middlewares/rbac');

/**
 * @desc    Get Dashboard KPIs, date filtered and role-scoped
 * @route   GET /api/reports/dashboard
 * @access  Authorized
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const { timeRange, startDate, endDate } = req.query;

    const baseFilter = getScopeFilter(req.user, 'assignedTo');

    // Date filter calculation
    let dateFilter = {};
    const now = new Date();

    if (timeRange === 'Today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (timeRange === 'ThisWeek') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfWeek } };
    } else if (timeRange === 'ThisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (timeRange === 'Custom' && startDate && endDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    const customerQuery = { ...baseFilter, ...dateFilter };
    const leadQuery = { ...baseFilter, ...dateFilter };
    const oppQuery = { ...baseFilter, ...dateFilter };

    // Parallel aggregate counts
    const [
      totalCustomers,
      totalLeads,
      openLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      pipelineAggregation
    ] = await Promise.all([
      Customer.countDocuments(customerQuery),
      Lead.countDocuments(leadQuery),
      Lead.countDocuments({ ...leadQuery, status: { $nin: ['Converted', 'Lost'] } }),
      Opportunity.countDocuments(oppQuery),
      Opportunity.countDocuments({ ...oppQuery, status: 'Open' }),
      Opportunity.countDocuments({ ...oppQuery, status: 'Won' }),
      Opportunity.countDocuments({ ...oppQuery, status: 'Lost' }),
      Opportunity.aggregate([
        { $match: { ...baseFilter, status: 'Open' } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$amount' },
            weightedValue: { $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] } }
          }
        }
      ])
    ]);

    const totalPipelineValue = pipelineAggregation.length > 0 ? pipelineAggregation[0].totalValue : 0;
    const totalWeightedPipeline = pipelineAggregation.length > 0 ? pipelineAggregation[0].weightedValue : 0;

    // Charts Data:
    // 1. Lead Status Distribution
    const leadStatusStats = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const leadStatusChart = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Unqualified: 0,
      Converted: 0,
      Lost: 0
    };
    leadStatusStats.forEach(item => {
      if (leadStatusChart[item._id] !== undefined) {
        leadStatusChart[item._id] = item.count;
      }
    });

    // 2. Opportunity Pipeline Stage Distribution & Value
    const oppStageStats = await Opportunity.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const pipelineChart = {
      Qualification: { count: 0, amount: 0 },
      Proposal: { count: 0, amount: 0 },
      Negotiation: { count: 0, amount: 0 },
      Won: { count: 0, amount: 0 },
      Lost: { count: 0, amount: 0 }
    };
    oppStageStats.forEach(item => {
      if (pipelineChart[item._id]) {
        pipelineChart[item._id] = { count: item.count, amount: item.totalAmount };
      }
    });

    // 3. Monthly Sales (Won deals by month over current year)
    const currentYear = new Date().getFullYear();
    const monthlySalesStats = await Opportunity.aggregate([
      {
        $match: {
          ...baseFilter,
          status: 'Won',
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesChart = months.map((month, idx) => {
      const match = monthlySalesStats.find(s => s._id === (idx + 1));
      return {
        month,
        totalSales: match ? match.totalSales : 0,
        count: match ? match.count : 0
      };
    });

    res.status(200).json({
      status: 200,
      kpis: {
        totalCustomers,
        totalLeads,
        openLeads,
        totalOpportunities,
        openOpportunities,
        wonOpportunities,
        lostOpportunities,
        totalPipelineValue,
        totalWeightedPipeline
      },
      charts: {
        leadStatus: leadStatusChart,
        opportunityPipeline: pipelineChart,
        monthlySales: monthlySalesChart
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Detailed Pipeline Report
 * @route   GET /api/reports/pipeline
 * @access  Authorized
 */
exports.getPipelineReport = async (req, res, next) => {
  try {
    const baseFilter = getScopeFilter(req.user, 'assignedTo');

    const [stageSummary, ownerSummary] = await Promise.all([
      Opportunity.aggregate([
        { $match: { ...baseFilter, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: '$stage',
            totalDeals: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            weightedAmount: { $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] } }
          }
        }
      ]),
      Opportunity.aggregate([
        { $match: { ...baseFilter, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: '$assignedTo',
            totalDeals: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            ownerId: '$_id',
            ownerName: '$owner.name',
            ownerEmail: '$owner.email',
            totalDeals: 1,
            totalAmount: 1
          }
        }
      ])
    ]);

    res.status(200).json({
      status: 200,
      stageSummary,
      ownerSummary
    });
  } catch (error) {
    next(error);
  }
};
