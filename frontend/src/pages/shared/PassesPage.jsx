import { useState, useEffect } from 'react';
import { passesAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiDownload, FiSlash, FiFilter } from 'react-icons/fi';
import '../admin/Dashboard.css';

const PassesPage = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { loadPasses(); }, [statusFilter, pagination.page]);

  const loadPasses = async () => {
    try {
      const res = await passesAPI.getAll({ status: statusFilter, page: pagination.page, limit: 15 });
      setPasses(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch {
      toast.error('Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, passCode) => {
    try {
      const res = await passesAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitor-pass-${passCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Badge downloaded');
    } catch {
      toast.error('Failed to download badge');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this pass?')) return;
    try {
      await passesAPI.revoke(id);
      toast.success('Pass revoked');
      loadPasses();
    } catch {
      toast.error('Failed to revoke pass');
    }
  };

  const statusColors = { active: 'badge-success', used: 'badge-info', expired: 'badge-warning', revoked: 'badge-danger' };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitor Passes</h1>
          <p className="page-subtitle">{pagination.total} passes total</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body flex items-center gap-4">
          <FiFilter className="text-muted" />
          <select className="form-control form-select" style={{ width: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper card">
        <table className="table">
          <thead>
            <tr>
              <th>Pass Code</th>
              <th>Visitor</th>
              <th>Host</th>
              <th>Valid Until</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center" style={{ padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : passes.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>No passes found</td></tr>
            ) : passes.map(p => (
              <tr key={p._id}>
                <td><code style={{ background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 600, fontSize: '0.8125rem' }}>{p.passCode}</code></td>
                <td><strong>{p.visitor?.name || '—'}</strong></td>
                <td className="text-secondary">{p.host?.name || '—'}</td>
                <td className="text-sm">{new Date(p.validUntil).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td><span className="badge badge-gray">{p.type}</span></td>
                <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(p._id, p.passCode)} title="Download Badge"><FiDownload /></button>
                    {p.status === 'active' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleRevoke(p._id)} title="Revoke"><FiSlash /></button>
                    )}
                  </div>
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

export default PassesPage;
