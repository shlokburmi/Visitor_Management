import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiCheck, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import '../admin/Dashboard.css';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { loadAppointments(); }, [statusFilter, pagination.page]);

  const loadAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAll({ status: statusFilter, page: pagination.page, limit: 15 });
      setAppointments(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await appointmentsAPI.approve(id);
      toast.success('Appointment approved');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await appointmentsAPI.reject(id);
      toast.success('Appointment rejected');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const statusColors = {
    pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger',
    completed: 'badge-info', cancelled: 'badge-gray',
  };

  const getVisitorName = (apt) => {
    if (apt.visitor) return apt.visitor.name;
    if (apt.visitorDetails?.name) return apt.visitorDetails.name;
    return 'Unknown';
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">{user?.role === 'host' ? 'My Appointments' : 'Appointments'}</h1>
          <p className="page-subtitle">{pagination.total} appointments found</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body flex items-center gap-4 flex-wrap">
          <FiFilter className="text-muted" />
          <select className="form-control form-select" style={{ width: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper card">
        <table className="table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Host</th>
              <th>Purpose</th>
              <th>Date & Time</th>
              <th>Status</th>
              {(user?.role === 'admin' || user?.role === 'host') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center" style={{ padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No appointments found</td></tr>
            ) : appointments.map(apt => (
              <tr key={apt._id}>
                <td><strong>{getVisitorName(apt)}</strong></td>
                <td className="text-secondary">{apt.host?.name || '—'}</td>
                <td className="text-secondary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.purpose}</td>
                <td className="text-sm">
                  <div>{new Date(apt.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-muted">{apt.scheduledTime}</div>
                </td>
                <td><span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span></td>
                {(user?.role === 'admin' || user?.role === 'host') && (
                  <td>
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => handleApprove(apt._id)} title="Approve"><FiCheck /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(apt._id)} title="Reject"><FiX /></button>
                      </div>
                    )}
                  </td>
                )}
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

export default AppointmentsPage;
