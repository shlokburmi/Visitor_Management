const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's visitor count (checked in today)
    const todayVisitors = await CheckLog.countDocuments({
      checkInTime: { $gte: today, $lt: tomorrow },
    });

    // Currently checked in
    const activeVisitors = await CheckLog.countDocuments({ status: 'checked_in' });

    // Active passes
    const activePasses = await Pass.countDocuments({ status: 'active' });

    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    // Total visitors registered
    const totalVisitors = await Visitor.countDocuments();

    // Total staff
    const totalStaff = await User.countDocuments({ role: { $in: ['security', 'host'] } });

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      scheduledDate: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      data: {
        todayVisitors,
        activeVisitors,
        activePasses,
        pendingAppointments,
        totalVisitors,
        totalStaff,
        todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity (last 10 check-ins/outs)
// @route   GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res, next) => {
  try {
    const logs = await CheckLog.find()
      .populate('visitor', 'name company photo')
      .populate('checkInBy', 'name')
      .populate('checkOutBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visitor trend data for charts
// @route   GET /api/dashboard/visitor-trend
const getVisitorTrend = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const trend = await CheckLog.aggregate([
      { $match: { checkInTime: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with zero counts
    const result = [];
    const current = new Date(startDate);
    const now = new Date();

    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0];
      const found = trend.find((t) => t._id === dateStr);
      result.push({
        date: dateStr,
        count: found ? found.count : 0,
      });
      current.setDate(current.getDate() + 1);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Export check logs as CSV
// @route   GET /api/dashboard/export
const exportLogs = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.checkInTime = {};
      if (dateFrom) query.checkInTime.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.checkInTime.$lte = end;
      }
    }

    const logs = await CheckLog.find(query)
      .populate('visitor', 'name email phone company')
      .populate('pass', 'passCode')
      .populate('checkInBy', 'name')
      .populate('checkOutBy', 'name')
      .sort({ checkInTime: -1 });

    // Build CSV
    const header = 'Visitor Name,Company,Phone,Email,Pass Code,Check In,Check Out,Gate,Checked In By,Checked Out By,Remarks\n';
    const rows = logs.map((log) => {
      return [
        log.visitor?.name || '',
        log.visitor?.company || '',
        log.visitor?.phone || '',
        log.visitor?.email || '',
        log.pass?.passCode || '',
        log.checkInTime ? new Date(log.checkInTime).toLocaleString() : '',
        log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : '',
        log.gate || '',
        log.checkInBy?.name || '',
        log.checkOutBy?.name || '',
        log.remarks || '',
      ].map(val => `"${val}"`).join(',');
    }).join('\n');

    const csv = header + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=visitor-logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getRecentActivity, getVisitorTrend, exportLogs };
