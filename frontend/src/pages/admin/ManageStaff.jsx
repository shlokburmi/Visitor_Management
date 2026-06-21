import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import '../admin/Dashboard.css';

const ManageStaff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'security', phone: '', department: '' });

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll({ search, role: roleFilter });
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser._id, form);
        toast.success('User updated');
      } else {
        await authAPI.register(form);
        toast.success('Staff account created');
      }
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '', department: u.department || '' });
    setShowModal(true);
  };

  const handleToggleActive = async (u) => {
    try {
      await usersAPI.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'security', phone: '', department: '' });
  };

  const roleColors = { admin: 'badge-info', security: 'badge-warning', host: 'badge-success' };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Staff</h1>
          <p className="page-subtitle">Create and manage staff accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiUserPlus /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body flex items-center gap-4 flex-wrap">
          <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
            <FiSearch className="input-icon" />
            <input className="form-control" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control form-select" style={{ width: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="security">Security</option>
            <option value="host">Host</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center" style={{ padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No staff found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td className="text-secondary">{u.email}</td>
                <td><span className={`badge ${roleColors[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                <td className="text-secondary">{u.department || '—'}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(u)} title="Edit"><FiEdit2 /></button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required disabled={!!editingUser} />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control form-select" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                    <option value="security">Security</option>
                    <option value="host">Host / Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-control" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
