const QRCode = require('qrcode');

// Generate QR code as data URL (base64 PNG)
const generateQRCode = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as buffer (for embedding in PDFs)
const generateQRBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return buffer;
  } catch (error) {
    console.error('QR buffer generation failed:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

module.exports = { generateQRCode, generateQRBuffer };
