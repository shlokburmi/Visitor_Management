import { useState, useEffect } from 'react';
import { checkLogsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiFilter, FiLogOut } from 'react-icons/fi';
import '../admin/Dashboard.css';

const CheckLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { loadLogs(); }, [statusFilter, dateFrom, dateTo, pagination.page]);

  const loadLogs = async () => {
    try {
      const params = { page: pagination.page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await checkLogsAPI.getAll(params);
      setLogs(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch {
      toast.error('Failed to load check logs');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (logId) => {
    try {
      await checkLogsAPI.checkOut({ checkLogId: logId });
      toast.success('Visitor checked out');
      loadLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check Logs</h1>
          <p className="page-subtitle">Visitor check-in/check-out history</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body flex items-center gap-4 flex-wrap">
          <FiFilter className="text-muted" />
          <select className="form-control form-select" style={{ width: 170 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
          <input type="date" className="form-control" style={{ width: 160 }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-muted text-sm">to</span>
          <input type="date" className="form-control" style={{ width: 160 }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper card">
        <table className="table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Pass Code</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
              <th>Gate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center" style={{ padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted" style={{ padding: '2rem' }}>No check logs found</td></tr>
            ) : logs.map(log => (
              <tr key={log._id}>
                <td><strong>{log.visitor?.name || '—'}</strong></td>
                <td><code style={{ background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>{log.pass?.passCode || '—'}</code></td>
                <td className="text-sm">{log.checkInTime ? new Date(log.checkInTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td className="text-sm">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td className="text-sm">{getDuration(log.checkInTime, log.checkOutTime)}</td>
                <td className="text-secondary">{log.gate || '—'}</td>
                <td><span className={`badge ${log.status === 'checked_in' ? 'badge-success' : 'badge-gray'}`}>{log.status === 'checked_in' ? 'Inside' : 'Left'}</span></td>
                <td>
                  {log.status === 'checked_in' && (
                    <button className="btn btn-sm btn-secondary" onClick={() => handleCheckOut(log._id)} title="Check Out"><FiLogOut /> Out</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({...p, page: p.page - 1}))}>Prev</button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => (
            <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => setPagination(p => ({...p, page: i + 1}))}>{i + 1}</button>
          ))}
          <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({...p, page: p.page + 1}))}>Next</button>
        </div>
      )}
    </div>
  );
};

export default CheckLogsPage;
