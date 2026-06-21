const { getTransporter } = require('../config/email');

// Send email using configured transporter
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: '"VPass System" <noreply@vpass.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    // For Ethereal, log the preview URL
    if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
      const nodemailer = require('nodemailer');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    // Don't throw — email failures shouldn't break the main flow
    return null;
  }
};

// Email template: Appointment Invitation
const sendAppointmentInvite = async (visitorEmail, visitorName, hostName, date, time, purpose) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f9fa; padding: 0;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">VISITOR PASS</h1>
        <p style="color: #a0a0cc; margin: 5px 0 0; font-size: 12px;">Management System</p>
      </div>
      <div style="padding: 25px 20px; background: #ffffff;">
        <p style="color: #333; font-size: 15px;">Hello <strong>${visitorName}</strong>,</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          You have been invited for a visit. Please find the details below:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px; width: 100px;">Host</td><td style="padding: 8px 0; color: #333; font-size: 13px; font-weight: 600;">${hostName}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Date</td><td style="padding: 8px 0; color: #333; font-size: 13px; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #333; font-size: 13px; font-weight: 600;">${time}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Purpose</td><td style="padding: 8px 0; color: #333; font-size: 13px; font-weight: 600;">${purpose}</td></tr>
        </table>
        <p style="color: #555; font-size: 13px; line-height: 1.6;">
          Please carry a valid photo ID for verification at the security desk.
        </p>
      </div>
      <div style="padding: 15px 20px; background: #f0f0f5; text-align: center;">
        <p style="color: #999; font-size: 11px; margin: 0;">This is an automated message from VPass System</p>
      </div>
    </div>
  `;
  return sendEmail({ to: visitorEmail, subject: `Visit Invitation from ${hostName}`, html });
};

// Email template: Appointment status update
const sendAppointmentStatusUpdate = async (visitorEmail, visitorName, status, hostName) => {
  const statusColors = { approved: '#27ae60', rejected: '#e74c3c', cancelled: '#f39c12' };
  const statusLabels = { approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled' };
  const color = statusColors[status] || '#888';
  const label = statusLabels[status] || status;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">VISITOR PASS</h1>
      </div>
      <div style="padding: 25px 20px; background: #ffffff;">
        <p style="color: #333; font-size: 15px;">Hello <strong>${visitorName}</strong>,</p>
        <p style="color: #555; font-size: 14px;">Your appointment with <strong>${hostName}</strong> has been:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="background: ${color}; color: #fff; padding: 8px 24px; border-radius: 20px; font-size: 16px; font-weight: 600; letter-spacing: 1px;">${label}</span>
        </div>
        ${status === 'approved' ? '<p style="color: #555; font-size: 13px;">Please arrive on time and carry a valid photo ID.</p>' : ''}
      </div>
    </div>
  `;
  return sendEmail({ to: visitorEmail, subject: `Appointment ${label} — VPass`, html });
};

// Email template: Pass issued notification
const sendPassIssuedNotification = async (visitorEmail, visitorName, passCode, validUntil) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">VISITOR PASS</h1>
      </div>
      <div style="padding: 25px 20px; background: #ffffff;">
        <p style="color: #333; font-size: 15px;">Hello <strong>${visitorName}</strong>,</p>
        <p style="color: #555; font-size: 14px;">Your visitor pass has been issued. Here are the details:</p>
        <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0 0 5px;">Pass Code</p>
          <p style="color: #1a1a2e; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 2px;">${passCode}</p>
        </div>
        <p style="color: #555; font-size: 13px;">Valid until: <strong>${new Date(validUntil).toLocaleString()}</strong></p>
        <p style="color: #555; font-size: 13px;">Please show this pass code or QR code at the security checkpoint.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: visitorEmail, subject: `Your Visitor Pass — ${passCode}`, html });
};

// Email template: Check-in notification to host
const sendCheckInNotification = async (hostEmail, hostName, visitorName, checkInTime) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Visitor Checked In</h1>
      </div>
      <div style="padding: 25px 20px; background: #ffffff;">
        <p style="color: #333; font-size: 15px;">Hello <strong>${hostName}</strong>,</p>
        <p style="color: #555; font-size: 14px;">
          Your visitor <strong>${visitorName}</strong> has checked in at
          <strong>${new Date(checkInTime).toLocaleTimeString()}</strong>.
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: hostEmail, subject: `Visitor ${visitorName} has arrived`, html });
};

module.exports = {
  sendEmail,
  sendAppointmentInvite,
  sendAppointmentStatusUpdate,
  sendPassIssuedNotification,
  sendCheckInNotification,
};
