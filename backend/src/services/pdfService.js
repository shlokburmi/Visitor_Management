const PDFDocument = require('pdfkit');
const { generateQRBuffer } = require('./qrService');

// Generate a visitor badge PDF and return it as a stream
const generateBadgePDF = async (passData) => {
  const doc = new PDFDocument({
    size: [340, 480],
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  const { visitor, host, passCode, purpose, validFrom, validUntil, qrCodeData } = passData;

  // -- Header band --
  doc.rect(0, 0, 340, 70).fill('#1a1a2e');
  doc.fontSize(18).fill('#ffffff').text('VISITOR PASS', 20, 18, { align: 'center', width: 300 });
  doc.fontSize(9).fill('#a0a0cc').text('Visitor Pass Management System', 20, 42, { align: 'center', width: 300 });

  // -- Visitor info section --
  doc.fill('#333333');
  doc.fontSize(14).text(visitor.name || 'Visitor', 20, 85, { align: 'center', width: 300 });
  doc.fontSize(9).fill('#888888').text(visitor.company || 'Walk-in Visitor', 20, 105, { align: 'center', width: 300 });

  // Divider
  doc.moveTo(30, 125).lineTo(310, 125).stroke('#e0e0e0');

  // Details
  const detailsTop = 135;
  const labelX = 30;
  const valueX = 130;

  const drawField = (label, value, yPos) => {
    doc.fontSize(8).fill('#888888').text(label, labelX, yPos);
    doc.fontSize(9).fill('#333333').text(value || 'N/A', valueX, yPos, { width: 180 });
  };

  drawField('Pass Code:', passCode, detailsTop);
  drawField('Host:', host?.name || 'N/A', detailsTop + 18);
  drawField('Department:', host?.department || 'N/A', detailsTop + 36);
  drawField('Purpose:', purpose || 'General Visit', detailsTop + 54);
  drawField('Valid From:', formatDate(validFrom), detailsTop + 72);
  drawField('Valid Until:', formatDate(validUntil), detailsTop + 90);
  drawField('Phone:', visitor.phone || 'N/A', detailsTop + 108);

  // Divider
  doc.moveTo(30, detailsTop + 130).lineTo(310, detailsTop + 130).stroke('#e0e0e0');

  // -- QR Code section --
  try {
    const qrBuffer = await generateQRBuffer(passCode);
    const qrX = (340 - 120) / 2;
    doc.image(qrBuffer, qrX, detailsTop + 142, { width: 120, height: 120 });
  } catch (err) {
    doc.fontSize(10).fill('#cc0000').text('QR Code Unavailable', 20, detailsTop + 180, { align: 'center', width: 300 });
  }

  // -- Footer --
  doc.fontSize(7).fill('#aaaaaa').text('Scan QR code at security checkpoint for verification', 20, 430, { align: 'center', width: 300 });
  doc.fontSize(6).fill('#cccccc').text(`Generated: ${new Date().toLocaleString()}`, 20, 445, { align: 'center', width: 300 });

  doc.end();
  return doc;
};

// Format date for display on badge
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

module.exports = { generateBadgePDF };
