require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Visitor = require('./src/models/Visitor');
const Appointment = require('./src/models/Appointment');
const Pass = require('./src/models/Pass');
const CheckLog = require('./src/models/CheckLog');
const { generateQRCode } = require('./src/services/qrService');
const { generatePassCode } = require('./src/utils/helpers');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});
    console.log('Cleared existing data');

    // ===== Create Users =====
    const admin = await User.create({
      name: 'Rajesh Kumar',
      email: 'admin@vpass.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
      department: 'Administration',
    });

    const security = await User.create({
      name: 'Suresh Patel',
      email: 'security@vpass.com',
      password: 'security123',
      role: 'security',
      phone: '+91 9876543211',
      department: 'Security',
    });

    const host = await User.create({
      name: 'Priya Sharma',
      email: 'priya@vpass.com',
      password: 'host123',
      role: 'host',
      phone: '+91 9876543212',
      department: 'Engineering',
    });

    const host2 = await User.create({
      name: 'Amit Verma',
      email: 'amit@vpass.com',
      password: 'host123',
      role: 'host',
      phone: '+91 9876543213',
      department: 'HR',
    });

    console.log('Created users');

    // ===== Create Visitors =====
    const visitor1 = await Visitor.create({
      name: 'Arun Mehta',
      email: 'arun.mehta@techcorp.com',
      phone: '+91 9988776601',
      company: 'TechCorp Solutions',
      idType: 'aadhar',
      idNumber: '4532 7654 3210',
      address: '45, MG Road, Bangalore',
    });

    const visitor2 = await Visitor.create({
      name: 'Sneha Reddy',
      email: 'sneha.r@globalinc.com',
      phone: '+91 9988776602',
      company: 'Global Inc.',
      idType: 'passport',
      idNumber: 'K4567890',
      address: '12, Jubilee Hills, Hyderabad',
    });

    const visitor3 = await Visitor.create({
      name: 'Vikram Singh',
      email: 'vikram@designhub.io',
      phone: '+91 9988776603',
      company: 'DesignHub',
      idType: 'driving_license',
      idNumber: 'DL-0420220012345',
      address: '78, Connaught Place, New Delhi',
    });

    const visitor4 = await Visitor.create({
      name: 'Meera Joshi',
      email: 'meera.joshi@startupx.com',
      phone: '+91 9988776604',
      company: 'StartupX',
      idType: 'aadhar',
      idNumber: '9876 5432 1098',
      address: '22, Koregaon Park, Pune',
    });

    const visitor5 = await Visitor.create({
      name: 'Rahul Nair',
      email: 'rahul.nair@freelance.com',
      phone: '+91 9988776605',
      company: 'Freelancer',
      idType: 'voter_id',
      idNumber: 'XYZ9876543',
      address: '56, Marine Drive, Mumbai',
    });

    console.log('Created visitors');

    // ===== Create Appointments =====
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const apt1 = await Appointment.create({
      visitor: visitor1._id,
      host: host._id,
      purpose: 'Technical discussion on cloud migration project',
      scheduledDate: today,
      scheduledTime: '10:00',
      expectedDuration: '2 hours',
      status: 'approved',
    });

    const apt2 = await Appointment.create({
      visitor: visitor2._id,
      host: host._id,
      purpose: 'Product demo and feedback session',
      scheduledDate: tomorrow,
      scheduledTime: '14:00',
      expectedDuration: '1 hour',
      status: 'pending',
    });

    const apt3 = await Appointment.create({
      visitor: visitor3._id,
      host: host2._id,
      purpose: 'Job interview — Senior UI Designer',
      scheduledDate: today,
      scheduledTime: '11:30',
      expectedDuration: '1 hour',
      status: 'approved',
    });

    const apt4 = await Appointment.create({
      visitor: visitor4._id,
      host: host2._id,
      purpose: 'Partnership meeting',
      scheduledDate: yesterday,
      scheduledTime: '15:00',
      expectedDuration: '2 hours',
      status: 'completed',
    });

    console.log('Created appointments');

    // ===== Create Passes =====
    const passCode1 = generatePassCode();
    const passCode2 = generatePassCode();
    const passCode3 = generatePassCode();

    const qr1 = await generateQRCode(passCode1);
    const qr2 = await generateQRCode(passCode2);
    const qr3 = await generateQRCode(passCode3);

    const pass1 = await Pass.create({
      passCode: passCode1,
      visitor: visitor1._id,
      appointment: apt1._id,
      host: host._id,
      issuedBy: security._id,
      qrCodeData: qr1,
      validFrom: today,
      validUntil: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      status: 'active',
      type: 'single',
    });

    const pass2 = await Pass.create({
      passCode: passCode2,
      visitor: visitor3._id,
      appointment: apt3._id,
      host: host2._id,
      issuedBy: security._id,
      qrCodeData: qr2,
      validFrom: today,
      validUntil: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: 'used',
      type: 'single',
    });

    const pass3 = await Pass.create({
      passCode: passCode3,
      visitor: visitor4._id,
      appointment: apt4._id,
      host: host2._id,
      issuedBy: admin._id,
      qrCodeData: qr3,
      validFrom: yesterday,
      validUntil: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
      status: 'expired',
      type: 'single',
    });

    console.log('Created passes');

    // ===== Create Check Logs =====
    const checkInTime1 = new Date(today);
    checkInTime1.setHours(10, 5, 0);

    await CheckLog.create({
      pass: pass1._id,
      visitor: visitor1._id,
      checkInTime: checkInTime1,
      checkInBy: security._id,
      gate: 'Main Gate',
      remarks: 'Verified ID — Aadhar card',
      status: 'checked_in',
    });

    const checkInTime2 = new Date(today);
    checkInTime2.setHours(11, 35, 0);
    const checkOutTime2 = new Date(today);
    checkOutTime2.setHours(13, 10, 0);

    await CheckLog.create({
      pass: pass2._id,
      visitor: visitor3._id,
      checkInTime: checkInTime2,
      checkOutTime: checkOutTime2,
      checkInBy: security._id,
      checkOutBy: security._id,
      gate: 'Main Gate',
      remarks: 'Interview candidate',
      status: 'checked_out',
    });

    const checkInTime3 = new Date(yesterday);
    checkInTime3.setHours(14, 55, 0);
    const checkOutTime3 = new Date(yesterday);
    checkOutTime3.setHours(17, 20, 0);

    await CheckLog.create({
      pass: pass3._id,
      visitor: visitor4._id,
      checkInTime: checkInTime3,
      checkOutTime: checkOutTime3,
      checkInBy: security._id,
      checkOutBy: security._id,
      gate: 'Gate 2',
      remarks: '',
      status: 'checked_out',
    });

    console.log('Created check logs');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== Login Credentials ===');
    console.log('Admin:    admin@vpass.com    / admin123');
    console.log('Security: security@vpass.com / security123');
    console.log('Host 1:   priya@vpass.com    / host123');
    console.log('Host 2:   amit@vpass.com     / host123');
    console.log('=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
