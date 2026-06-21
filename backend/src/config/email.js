const nodemailer = require('nodemailer');

// Create reusable transporter
// For development: uses Ethereal (fake SMTP that catches emails)
// For production: swap with real SMTP credentials (SendGrid, Gmail, etc.)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

module.exports = { getTransporter };
