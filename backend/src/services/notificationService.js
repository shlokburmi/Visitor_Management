const emailService = require('./emailService');

// Unified notification service
// Wraps email sending and simulates SMS logging
// Can be extended with Twilio/real SMS provider in the future

const notifyVisitorInvite = async (visitorDetails, hostName, date, time, purpose) => {
  // Send email if visitor has an email
  if (visitorDetails.email) {
    await emailService.sendAppointmentInvite(
      visitorDetails.email,
      visitorDetails.name,
      hostName,
      date,
      time,
      purpose
    );
  }

  // Simulate SMS notification
  if (visitorDetails.phone) {
    console.log(`[SMS Simulation] To: ${visitorDetails.phone}`);
    console.log(`Message: Hi ${visitorDetails.name}, you're invited to visit ${hostName} on ${date} at ${time}. Purpose: ${purpose}. Please carry a valid ID.`);
  }
};

const notifyAppointmentStatus = async (visitorDetails, status, hostName) => {
  if (visitorDetails.email) {
    await emailService.sendAppointmentStatusUpdate(
      visitorDetails.email,
      visitorDetails.name,
      status,
      hostName
    );
  }

  if (visitorDetails.phone) {
    console.log(`[SMS Simulation] To: ${visitorDetails.phone}`);
    console.log(`Message: Hi ${visitorDetails.name}, your appointment with ${hostName} has been ${status}.`);
  }
};

const notifyPassIssued = async (visitorDetails, passCode, validUntil) => {
  if (visitorDetails.email) {
    await emailService.sendPassIssuedNotification(
      visitorDetails.email,
      visitorDetails.name,
      passCode,
      validUntil
    );
  }

  if (visitorDetails.phone) {
    console.log(`[SMS Simulation] To: ${visitorDetails.phone}`);
    console.log(`Message: Hi ${visitorDetails.name}, your visitor pass (${passCode}) has been issued. Show this at the security desk.`);
  }
};

const notifyHostCheckIn = async (hostDetails, visitorName, checkInTime) => {
  if (hostDetails.email) {
    await emailService.sendCheckInNotification(
      hostDetails.email,
      hostDetails.name,
      visitorName,
      checkInTime
    );
  }
};

module.exports = {
  notifyVisitorInvite,
  notifyAppointmentStatus,
  notifyPassIssued,
  notifyHostCheckIn,
};
