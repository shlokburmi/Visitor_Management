import { useState, useEffect } from 'react';
import { checkLogsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiLogOut, FiRefreshCw } from 'react-icons/fi';
import '../admin/Dashboard.css';
import '../security/ScanPage.css';

const ActiveVisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadActive(); }, []);

  const loadActive = async () => {
    try {
      const res = await checkLogsAPI.getActive();
      setVisitors(res.data.data);
    } catch {
      toast.error('Failed to load active visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (logId) => {
    try {
      await checkLogsAPI.checkOut({ checkLogId: logId });
      toast.success('Visitor checked out');
      loadActive();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Active Visitors</h1>
          <p className="page-subtitle">{visitors.length} visitors currently inside</p>
        </div>
        <button className="btn btn-secondary" onClick={loadActive}><FiRefreshCw /> Refresh</button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : visitors.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🏢</div><h3>No Active Visitors</h3><p>All clear! No visitors are currently checked in.</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {visitors.map(log => (
            <div key={log._id} className="card" style={{ animation: 'slideUp 0.3s ease' }}>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="visitor-avatar">{log.visitor?.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{log.visitor?.name}</h4>
                    <p className="text-sm text-muted">{log.visitor?.company || 'Walk-in'}</p>
                  </div>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Inside</span>
                </div>
                <div className="visitor-detail-row"><span className="detail-label">Phone</span><span className="detail-value">{log.visitor?.phone}</span></div>
                <div className="visitor-detail-row"><span className="detail-label">Pass</span><span className="detail-value"><code>{log.pass?.passCode || '—'}</code></span></div>
                <div className="visitor-detail-row"><span className="detail-label">Checked In</span><span className="detail-value">{new Date(log.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="visitor-detail-row"><span className="detail-label">Gate</span><span className="detail-value">{log.gate}</span></div>
                <button className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={() => handleCheckOut(log._id)}>
                  <FiLogOut /> Check Out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveVisitorsPage;
