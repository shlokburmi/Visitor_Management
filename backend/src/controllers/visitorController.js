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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins

    // Find or create visitor record
    let visitor = await Visitor.findOne({ phone });
    if (!visitor) {
      visitor = await Visitor.create({ name, email, phone, company, otp, otpExpiry });
    } else {
      visitor.otp = otp;
      visitor.otpExpiry = otpExpiry;
      await visitor.save();
    }

    // Attempt to send email (in a real app we would use an email template)
    if (email) {
      try {
        const { getTransporter } = require('../config/email');
        const transporter = getTransporter();
        await transporter.sendMail({
          from: '"VPass System" <no-reply@vpass.com>',
          to: email,
          subject: 'Your Visitor Pre-Registration OTP',
          text: `Your OTP for verification is ${otp}. It is valid for 10 minutes.`
        });
      } catch (err) {
        console.error('Email send failed:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pre-registration initiated. Please verify with the OTP sent to your email or phone.',
      requiresOtp: true,
      data: { visitorId: visitor._id, phone: visitor.phone },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for visitor pre-registration
// @route   POST /api/visitors/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const visitor = await Visitor.findOne({ phone }).select('+otp +otpExpiry');
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    if (visitor.otp !== otp || visitor.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    visitor.isVerified = true;
    visitor.otp = undefined;
    visitor.otpExpiry = undefined;
    await visitor.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Your pre-registration is confirmed.',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVisitor, getVisitors, getVisitor, updateVisitor, preRegister, verifyOtp };
