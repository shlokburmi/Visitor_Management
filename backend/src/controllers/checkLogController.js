const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const { notifyHostCheckIn } = require('../services/notificationService');

// @desc    Check in a visitor (by pass code from QR scan)
// @route   POST /api/checklogs/checkin
const checkIn = async (req, res, next) => {
  try {
    const { passCode, gate, remarks } = req.body;

    if (!passCode) {
      return res.status(400).json({ success: false, message: 'Pass code is required' });
    }

    // Find the pass
    const pass = await Pass.findOne({ passCode })
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid pass code' });
    }

    // Check pass validity
    if (pass.status === 'revoked') {
      return res.status(400).json({ success: false, message: 'This pass has been revoked' });
    }

    if (pass.status === 'expired' || new Date() > new Date(pass.validUntil)) {
      pass.status = 'expired';
      await pass.save();
      return res.status(400).json({ success: false, message: 'This pass has expired' });
    }

    // Check if already checked in (no checkout yet)
    const activeCheckIn = await CheckLog.findOne({
      pass: pass._id,
      status: 'checked_in',
    });

    if (activeCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked in. Please check out first.',
      });
    }

    const now = new Date();

    // Create check log entry
    const checkLog = await CheckLog.create({
      pass: pass._id,
      visitor: pass.visitor._id,
      checkInTime: now,
      checkInBy: req.user._id,
      gate: gate || 'Main Gate',
      remarks: remarks || '',
      status: 'checked_in',
    });

    // Mark pass as used
    pass.status = 'used';
    await pass.save();

    // Notify host that their visitor has arrived
    if (pass.host) {
      notifyHostCheckIn(pass.host, pass.visitor.name, now);
    }

    const populated = await CheckLog.findById(checkLog._id)
      .populate('visitor', 'name email phone company photo')
      .populate('pass', 'passCode')
      .populate('checkInBy', 'name');

    res.status(201).json({
      success: true,
      message: `${pass.visitor.name} checked in successfully`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out a visitor
// @route   POST /api/checklogs/checkout
const checkOut = async (req, res, next) => {
  try {
    const { checkLogId, passCode } = req.body;

    let checkLog;

    if (checkLogId) {
      checkLog = await CheckLog.findById(checkLogId);
    } else if (passCode) {
      const pass = await Pass.findOne({ passCode });
      if (pass) {
        checkLog = await CheckLog.findOne({ pass: pass._id, status: 'checked_in' });
      }
    }

    if (!checkLog) {
      return res.status(404).json({ success: false, message: 'No active check-in found' });
    }

    if (checkLog.status === 'checked_out') {
      return res.status(400).json({ success: false, message: 'Visitor is already checked out' });
    }

    checkLog.checkOutTime = new Date();
    checkLog.checkOutBy = req.user._id;
    checkLog.status = 'checked_out';
    await checkLog.save();

    const populated = await CheckLog.findById(checkLog._id)
      .populate('visitor', 'name email phone company')
      .populate('pass', 'passCode')
      .populate('checkInBy', 'name')
      .populate('checkOutBy', 'name');

    res.json({
      success: true,
      message: 'Visitor checked out successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check logs (with filters)
// @route   GET /api/checklogs
const getCheckLogs = async (req, res, next) => {
  try {
    const { status, visitorId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (visitorId) query.visitor = visitorId;

    if (dateFrom || dateTo) {
      query.checkInTime = {};
      if (dateFrom) query.checkInTime.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.checkInTime.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CheckLog.countDocuments(query);
    const logs = await CheckLog.find(query)
      .populate('visitor', 'name email phone company photo')
      .populate('pass', 'passCode host')
      .populate('checkInBy', 'name')
      .populate('checkOutBy', 'name')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently checked-in visitors
// @route   GET /api/checklogs/active
const getActiveCheckIns = async (req, res, next) => {
  try {
    const logs = await CheckLog.find({ status: 'checked_in' })
      .populate('visitor', 'name email phone company photo')
      .populate('pass', 'passCode host validUntil')
      .populate('checkInBy', 'name')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut, getCheckLogs, getActiveCheckIns };
