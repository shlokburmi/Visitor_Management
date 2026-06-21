const Visitor = require('../models/Visitor');

// @desc    Create a new visitor
// @route   POST /api/visitors
const createVisitor = async (req, res, next) => {
  try {
    const { name, email, phone, company, idType, idNumber, address } = req.body;

    // Check if visitor with same phone already exists
    const existing = await Visitor.findOne({ phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A visitor with this phone number already exists',
        data: existing,
      });
    }

    const visitorData = { name, email, phone, company, idType, idNumber, address };

    // If photo was uploaded via multer
    if (req.file) {
      visitorData.photo = req.file.filename;
    }

    const visitor = await Visitor.create(visitorData);

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully',
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visitors (with search and pagination)
// @route   GET /api/visitors
const getVisitors = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Visitor.countDocuments(query);
    const visitors = await Visitor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: visitors,
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

// @desc    Get single visitor with visit history
// @route   GET /api/visitors/:id
const getVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, data: visitor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visitor info
// @route   PUT /api/visitors/:id
const updateVisitor = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const visitor = await Visitor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, message: 'Visitor updated', data: visitor });
  } catch (error) {
    next(error);
  }
};

// @desc    Public pre-registration for visitors
// @route   POST /api/visitors/pre-register
const preRegister = async (req, res, next) => {
  try {
    const { name, email, phone, company, hostEmail, purpose, visitDate, visitTime } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    // Find or create visitor record
    let visitor = await Visitor.findOne({ phone });
    if (!visitor) {
      visitor = await Visitor.create({ name, email, phone, company });
    }

    res.status(201).json({
      success: true,
      message: 'Pre-registration submitted successfully. You will be notified once your visit is approved.',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVisitor, getVisitors, getVisitor, updateVisitor, preRegister };
