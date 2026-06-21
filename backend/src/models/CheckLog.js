const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema({
  pass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass',
    required: [true, 'Pass reference is required'],
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: [true, 'Visitor reference is required'],
  },
  checkInTime: {
    type: Date,
    default: null,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  checkInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  checkOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  gate: {
    type: String,
    trim: true,
    default: 'Main Gate',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['checked_in', 'checked_out'],
    default: 'checked_in',
  },
}, {
  timestamps: true,
});

checkLogSchema.index({ visitor: 1, createdAt: -1 });
checkLogSchema.index({ status: 1 });
checkLogSchema.index({ checkInTime: -1 });

module.exports = mongoose.model('CheckLog', checkLogSchema);
