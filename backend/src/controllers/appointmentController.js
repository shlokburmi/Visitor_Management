const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { notifyVisitorInvite, notifyAppointmentStatus } = require('../services/notificationService');

// @desc    Create appointment / invite visitor
// @route   POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const { visitorId, visitorName, visitorEmail, visitorPhone, visitorCompany,
            purpose, scheduledDate, scheduledTime, expectedDuration, notes } = req.body;

    let visitor = null;

    // If visitorId is provided, link to existing visitor
    if (visitorId) {
      visitor = await Visitor.findById(visitorId);
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Visitor not found' });
      }
    }

    const appointment = await Appointment.create({
      visitor: visitor ? visitor._id : null,
      host: req.user._id,
      purpose,
      scheduledDate,
      scheduledTime,
      expectedDuration: expectedDuration || '1 hour',
      notes,
      preRegistered: !visitor,
      visitorDetails: !visitor ? {
        name: visitorName,
        email: visitorEmail,
        phone: visitorPhone,
        company: visitorCompany,
      } : undefined,
    });

    // Send notification to visitor
    const vDetails = visitor
      ? { name: visitor.name, email: visitor.email, phone: visitor.phone }
      : { name: visitorName, email: visitorEmail, phone: visitorPhone };

    const dateStr = new Date(scheduledDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    notifyVisitorInvite(vDetails, req.user.name, dateStr, scheduledTime, purpose);

    const populated = await Appointment.findById(appointment._id)
      .populate('visitor', 'name email phone company')
      .populate('host', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Appointment created and invitation sent',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments (filtered by host, date, status)
// @route   GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { status, date, hostId, page = 1, limit = 20 } = req.query;
    const query = {};

    // Non-admin users see only their own appointments
    if (req.user.role === 'host') {
      query.host = req.user._id;
    } else if (hostId) {
      query.host = hostId;
    }

    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('visitor', 'name email phone company photo')
      .populate('host', 'name email department')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: appointments,
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

// @desc    Get single appointment
// @route   GET /api/appointments/:id
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email phone company photo idType idNumber')
      .populate('host', 'name email department phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('visitor', 'name email phone company')
      .populate('host', 'name email department');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment updated', data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve appointment
// @route   PUT /api/appointments/:id/approve
const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email phone')
      .populate('host', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot approve — appointment is already ${appointment.status}` });
    }

    appointment.status = 'approved';
    await appointment.save();

    // Notify visitor
    const vDetails = appointment.visitor
      ? { name: appointment.visitor.name, email: appointment.visitor.email, phone: appointment.visitor.phone }
      : appointment.visitorDetails;

    notifyAppointmentStatus(vDetails, 'approved', appointment.host.name);

    res.json({ success: true, message: 'Appointment approved', data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject appointment
// @route   PUT /api/appointments/:id/reject
const rejectAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email phone')
      .populate('host', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = 'rejected';
    await appointment.save();

    const vDetails = appointment.visitor
      ? { name: appointment.visitor.name, email: appointment.visitor.email, phone: appointment.visitor.phone }
      : appointment.visitorDetails;

    notifyAppointmentStatus(vDetails, 'rejected', appointment.host.name);

    res.json({ success: true, message: 'Appointment rejected', data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  approveAppointment,
  rejectAppointment,
};
