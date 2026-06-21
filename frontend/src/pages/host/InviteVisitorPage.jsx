import { useState } from 'react';
import { appointmentsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiSend, FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiClock } from 'react-icons/fi';
import '../admin/Dashboard.css';

const InviteVisitorPage = () => {
  const [form, setForm] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitorCompany: '',
    purpose: '',
    scheduledDate: '',
    scheduledTime: '',
    expectedDuration: '1 hour',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.visitorName || !form.purpose || !form.scheduledDate || !form.scheduledTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await appointmentsAPI.create(form);
      toast.success('Invitation sent successfully!');
      setSent(true);
      setForm({
        visitorName: '', visitorEmail: '', visitorPhone: '', visitorCompany: '',
        purpose: '', scheduledDate: '', scheduledTime: '', expectedDuration: '1 hour', notes: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="page-enter">
        <div className="card" style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Invitation Sent!</h2>
            <p className="text-secondary" style={{ marginBottom: '2rem' }}>
              The visitor will receive an email notification with the appointment details.
            </p>
            <button className="btn btn-primary" onClick={() => setSent(false)}>
              <FiSend /> Send Another Invitation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invite Visitor</h1>
          <p className="page-subtitle">Send a visit invitation to your guest</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-600)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visitor Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group"><label className="form-label">Visitor Name *</label><input name="visitorName" className="form-control" value={form.visitorName} onChange={handleChange} placeholder="Jane Smith" required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input name="visitorPhone" className="form-control" value={form.visitorPhone} onChange={handleChange} placeholder="+91 9876543210" /></div>
              <div className="form-group"><label className="form-label">Email</label><input name="visitorEmail" type="email" className="form-control" value={form.visitorEmail} onChange={handleChange} placeholder="visitor@email.com" /></div>
              <div className="form-group"><label className="form-label">Company</label><input name="visitorCompany" className="form-control" value={form.visitorCompany} onChange={handleChange} placeholder="Acme Inc." /></div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0 1.5rem' }} />
            <h4 style={{ marginBottom: '1rem', color: 'var(--gray-600)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visit Details</h4>

            <div className="form-group"><label className="form-label">Purpose of Visit *</label><input name="purpose" className="form-control" value={form.purpose} onChange={handleChange} placeholder="e.g. Business Meeting, Interview, Delivery" required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group"><label className="form-label">Date *</label><input name="scheduledDate" type="date" className="form-control" value={form.scheduledDate} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Time *</label><input name="scheduledTime" type="time" className="form-control" value={form.scheduledTime} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Duration</label>
                <select name="expectedDuration" className="form-control form-select" value={form.expectedDuration} onChange={handleChange}>
                  <option value="30 mins">30 mins</option><option value="1 hour">1 hour</option><option value="2 hours">2 hours</option><option value="Half day">Half day</option><option value="Full day">Full day</option>
                </select>
              </div>
            </div>

            <div className="form-group"><label className="form-label">Notes (optional)</label><textarea name="notes" className="form-control" rows="3" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." /></div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <FiSend /> {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteVisitorPage;
