const Mobile = require('../models/Mobile');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const query = { user: userId };
    const listFields = 'hasImei imei1 brand model status';

    const [statsResult, recentMobiles] = await Promise.all([
      Mobile.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
            sold: { $sum: { $cond: [{ $eq: ['$status', 'SOLD'] }, 1, 0] } },
          },
        },
      ]),
      Mobile.find(query).select(listFields).lean().sort({ createdAt: -1 }).limit(10),
    ]);

    const stats = statsResult[0] || { total: 0, available: 0, sold: 0 };

    res.status(200).json({
      success: true,
      data: {
        total: stats.total,
        available: stats.available,
        sold: stats.sold,
        recentMobiles,
      },
    });
  } catch (error) {
    next(error);
  }
};
