import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { passesAPI, checkLogsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiXCircle, FiLogIn, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import './ScanPage.css';

const ScanPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [passData, setPassData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      startScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scanning]);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    });

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {});
        setScanResult(decodedText);
        setScanning(false);
        verifyPass(decodedText);
      },
      (error) => {
        // Scan error (normal while scanning, ignore)
      }
    );

    scannerRef.current = scanner;
  };

  const verifyPass = async (passCode) => {
    setVerifying(true);
    try {
      const res = await passesAPI.verify(passCode);
      setPassData(res.data.data);
    } catch (err) {
      setPassData({ isValid: false, statusMessage: err.response?.data?.message || 'Invalid pass code' });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult) return;
    try {
      const res = await checkLogsAPI.checkIn({ passCode: scanResult });
      toast.success(res.data.message);
      resetScanner();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!scanResult) return;
    try {
      const res = await checkLogsAPI.checkOut({ passCode: scanResult });
      toast.success(res.data.message);
      resetScanner();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setPassData(null);
    setScanning(true);
  };

  // Manual pass code entry
  const [manualCode, setManualCode] = useState('');
  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setScanResult(manualCode.trim());
    setScanning(false);
    verifyPass(manualCode.trim());
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan QR Code</h1>
          <p className="page-subtitle">Scan a visitor's pass to verify and check in/out</p>
        </div>
      </div>

      <div className="scan-layout">
        {/* Scanner Section */}
        <div className="card scan-card">
          <div className="card-header">
            <h3 className="card-title"><FiCamera style={{ marginRight: 8 }} />QR Scanner</h3>
            {!scanning && (
              <button className="btn btn-sm btn-secondary" onClick={resetScanner}><FiRefreshCw /> Scan Again</button>
            )}
          </div>
          <div className="card-body">
            {scanning ? (
              <div id="qr-reader" className="qr-reader-container"></div>
            ) : (
              <div className="scan-complete">
                <FiCheckCircle className="scan-complete-icon" />
                <p>Code scanned: <strong>{scanResult}</strong></p>
              </div>
            )}

            {/* Manual entry */}
            <div className="manual-entry">
              <p className="text-sm text-muted mb-2">Or enter pass code manually:</p>
              <form onSubmit={handleManualVerify} className="flex gap-2">
                <input className="form-control" placeholder="e.g. VP-8A3F2D" value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary btn-sm">Verify</button>
              </form>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="card result-card">
          <div className="card-header">
            <h3 className="card-title">Verification Result</h3>
          </div>
          <div className="card-body">
            {verifying ? (
              <div className="text-center" style={{ padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p className="text-muted mt-3">Verifying pass...</p>
              </div>
            ) : !passData ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>Awaiting Scan</h3>
                <p>Scan a QR code or enter a pass code to see visitor details</p>
              </div>
            ) : !passData.pass ? (
              <div className="verification-result result-invalid">
                <FiXCircle className="result-icon" />
                <h3>Invalid Pass</h3>
                <p>{passData.statusMessage}</p>
                <button className="btn btn-secondary mt-4" onClick={resetScanner}><FiRefreshCw /> Try Again</button>
              </div>
            ) : (
              <div className="verification-result">
                <div className={`result-status ${passData.isValid ? 'result-valid' : 'result-invalid'}`}>
                  {passData.isValid ? <FiCheckCircle /> : <FiXCircle />}
                  <span>{passData.statusMessage}</span>
                </div>

                <div className="visitor-details">
                  <div className="visitor-detail-row">
                    <span className="detail-label">Visitor</span>
                    <span className="detail-value">{passData.pass.visitor?.name}</span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{passData.pass.visitor?.company || '—'}</span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{passData.pass.visitor?.phone}</span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Host</span>
                    <span className="detail-value">{passData.pass.host?.name || '—'}</span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Pass Code</span>
                    <span className="detail-value"><code>{passData.pass.passCode}</code></span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Valid Until</span>
                    <span className="detail-value">{new Date(passData.pass.validUntil).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="visitor-detail-row">
                    <span className="detail-label">Status</span>
                    <span className={`badge ${passData.pass.status === 'active' ? 'badge-success' : passData.pass.status === 'used' ? 'badge-info' : 'badge-danger'}`}>{passData.pass.status}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn btn-success btn-lg" onClick={handleCheckIn}>
                    <FiLogIn /> Check In
                  </button>
                  <button className="btn btn-secondary btn-lg" onClick={handleCheckOut}>
                    <FiLogOut /> Check Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
