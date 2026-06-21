const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    default: null,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required'],
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
    trim: true,
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
  },
  expectedDuration: {
    type: String,
    default: '1 hour',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  preRegistered: {
    type: Boolean,
    default: false,
  },
  // Embedded visitor details for pre-registration (before a Visitor record exists)
  visitorDetails: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
  },
}, {
  timestamps: true,
});

appointmentSchema.index({ host: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
