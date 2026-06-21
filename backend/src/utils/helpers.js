const crypto = require('crypto');

// Generate a unique pass code like "VP-8A3F2D"
const generatePassCode = () => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VP-${hex}`;
};

// Format date for display (e.g., "21 Jun 2026")
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format time for display (e.g., "10:30 AM")
const formatTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

module.exports = { generatePassCode, formatDate, formatTime };
