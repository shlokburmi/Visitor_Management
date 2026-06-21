import { useState } from 'react';
import { dashboardAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiDownload, FiBarChart2 } from 'react-icons/fi';
import '../admin/Dashboard.css';

const ReportsPage = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await dashboardAPI.exportLogs(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitor-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Export visitor logs as CSV</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><FiBarChart2 style={{ marginRight: 8 }} />Export Visitor Logs</h3>
        </div>
        <div className="card-body">
          <p className="text-secondary mb-4">Select a date range and download the check-in/check-out records as a CSV file.</p>
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-control" style={{ width: 180 }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-control" style={{ width: 180 }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            <FiDownload /> {exporting ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
