import { useState, useEffect } from 'react';
import { visitorsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiSearch, FiUserPlus, FiX, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';
import '../admin/Dashboard.css';

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', idType: 'other', idNumber: '', address: '' });

  useEffect(() => { loadVisitors(); }, [search, pagination.page]);

  const loadVisitors = async () => {
    try {
      const res = await visitorsAPI.getAll({ search, page: pagination.page, limit: 15 });
      setVisitors(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      if (form.photoFile) formData.append('photo', form.photoFile);
      await visitorsAPI.create(formData);
      toast.success('Visitor registered');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', company: '', idType: 'other', idNumber: '', address: '' });
      loadVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register visitor');
    }
  };

  const idTypeLabels = { aadhar: 'Aadhar', passport: 'Passport', driving_license: 'Driving License', voter_id: 'Voter ID', other: 'Other' };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">{pagination.total} visitors registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiUserPlus /> Register Visitor
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="input-with-icon">
            <FiSearch className="input-icon" />
            <input className="form-control" placeholder="Search by name, phone, email or company..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(p => ({...p, page: 1})); }} />
          </div>
        </div>
      </div>

      <div className="table-wrapper card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company</th>
              <th>ID Type</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center" style={{ padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No visitors found</td></tr>
            ) : visitors.map(v => (
              <tr key={v._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="visitor-avatar">{v.name?.charAt(0).toUpperCase()}</div>
                    <strong>{v.name}</strong>
                  </div>
                </td>
                <td className="text-secondary">{v.phone}</td>
                <td className="text-secondary">{v.email || '—'}</td>
                <td className="text-secondary">{v.company || '—'}</td>
                <td><span className="badge badge-gray">{idTypeLabels[v.idType] || v.idType}</span></td>
                <td className="text-secondary text-sm">{new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({...p, page: p.page - 1}))}>Prev</button>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => setPagination(p => ({...p, page: i + 1}))}>{i + 1}</button>
          ))}
          <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({...p, page: p.page + 1}))}>Next</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Visitor</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-control" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-control" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">ID Type</label>
                    <select className="form-control form-select" value={form.idType} onChange={(e) => setForm({...form, idType: e.target.value})}>
                      <option value="aadhar">Aadhar Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID Number</label>
                    <input className="form-control" value={form.idNumber} onChange={(e) => setForm({...form, idNumber: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="2" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Photo</label>
                  <input type="file" accept="image/*" className="form-control" onChange={(e) => setForm({...form, photoFile: e.target.files[0]})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorsPage;
