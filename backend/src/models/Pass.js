const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  passCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: [true, 'Visitor is required'],
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required'],
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issuer is required'],
  },
  qrCodeData: {
    type: String, // base64 data URL of QR image
    default: '',
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'revoked'],
    default: 'active',
  },
  type: {
    type: String,
    enum: ['single', 'multi_day', 'recurring'],
    default: 'single',
  },
}, {
  timestamps: true,
});

passSchema.index({ status: 1 });
passSchema.index({ visitor: 1 });
passSchema.index({ validUntil: 1 });

module.exports = mongoose.model('Pass', passSchema);
