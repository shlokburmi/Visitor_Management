const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const { generateQRCode } = require('../services/qrService');
const { generateBadgePDF } = require('../services/pdfService');
const { generatePassCode } = require('../utils/helpers');
const { notifyPassIssued } = require('../services/notificationService');

// @desc    Issue a new visitor pass
// @route   POST /api/passes
const issuePass = async (req, res, next) => {
  try {
    const { visitorId, appointmentId, hostId, validFrom, validUntil, type } = req.body;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    // Generate unique pass code
    let passCode = generatePassCode();
    // Make sure it's unique (very unlikely collision but just in case)
    while (await Pass.findOne({ passCode })) {
      passCode = generatePassCode();
    }

    // Generate QR code containing the pass code
    const qrCodeData = await generateQRCode(passCode);

    const pass = await Pass.create({
      passCode,
      visitor: visitorId,
      appointment: appointmentId || null,
      host: hostId || req.user._id,
      issuedBy: req.user._id,
      qrCodeData,
      validFrom: validFrom || new Date(),
      validUntil: validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // default 24 hours
      type: type || 'single',
    });

    // Send notification to visitor
    notifyPassIssued(
      { name: visitor.name, email: visitor.email, phone: visitor.phone },
      passCode,
      pass.validUntil
    );

    const populated = await Pass.findById(pass._id)
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department')
      .populate('issuedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Pass issued successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all passes (filterable)
// @route   GET /api/passes
const getPasses = async (req, res, next) => {
  try {
    const { status, visitorId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (visitorId) query.visitor = visitorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Pass.countDocuments(query);
    const passes = await Pass.find(query)
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: passes,
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

// @desc    Get single pass
// @route   GET /api/passes/:id
const getPass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor', 'name email phone company photo idType idNumber')
      .populate('host', 'name email department phone')
      .populate('issuedBy', 'name');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    res.json({ success: true, data: pass });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify pass by pass code (used by QR scanner)
// @route   GET /api/passes/verify/:passCode
const verifyPass = async (req, res, next) => {
  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode })
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department')
      .populate('issuedBy', 'name');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid pass code — no pass found' });
    }

    // Check if pass is expired
    if (new Date() > new Date(pass.validUntil)) {
      pass.status = 'expired';
      await pass.save();
    }

    const isValid = pass.status === 'active';

    res.json({
      success: true,
      data: {
        pass,
        isValid,
        statusMessage: isValid
          ? 'Pass is valid'
          : `Pass is ${pass.status}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download pass as PDF badge
// @route   GET /api/passes/:id/download
const downloadPass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department')
      .populate('appointment', 'purpose');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    const pdfDoc = await generateBadgePDF({
      visitor: pass.visitor,
      host: pass.host,
      passCode: pass.passCode,
      purpose: pass.appointment?.purpose || 'General Visit',
      validFrom: pass.validFrom,
      validUntil: pass.validUntil,
      qrCodeData: pass.qrCodeData,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=visitor-pass-${pass.passCode}.pdf`);
    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke a pass
// @route   PUT /api/passes/:id/revoke
const revokePass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    pass.status = 'revoked';
    await pass.save();

    res.json({ success: true, message: 'Pass revoked', data: pass });
  } catch (error) {
    next(error);
  }
};

module.exports = { issuePass, getPasses, getPass, verifyPass, downloadPass, revokePass };
