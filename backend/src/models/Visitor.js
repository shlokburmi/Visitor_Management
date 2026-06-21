const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Visitor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  company: {
    type: String,
    trim: true,
    default: '',
  },
  photo: {
    type: String,
    default: '',
  },
  idType: {
    type: String,
    enum: ['aadhar', 'passport', 'driving_license', 'voter_id', 'other'],
    default: 'other',
  },
  idNumber: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes for search
visitorSchema.index({ phone: 1 });
visitorSchema.index({ email: 1 });
visitorSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('Visitor', visitorSchema);
