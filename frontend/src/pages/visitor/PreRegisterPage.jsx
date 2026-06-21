import { useState } from 'react';
import { visitorsAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiMail, FiBriefcase, FiMapPin } from 'react-icons/fi';
import './PreRegister.css';

const PreRegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', purpose: '', visitDate: '', visitTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required');
      return;
    }

    setLoading(true);
    try {
      await visitorsAPI.preRegister(form);
      toast.success('Pre-registration submitted!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pre-register-layout">
        <div className="pre-register-bg"></div>
        <div className="pre-register-container">
          <div className="pre-register-brand">
            <span className="pre-register-logo">VP</span>
            <h1>VPass</h1>
          </div>
          <div className="pre-register-card success-card">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2>Registration Complete!</h2>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
              Your pre-registration has been submitted successfully. You will be notified once approved.
              Please carry a valid photo ID for verification.
            </p>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', purpose: '', visitDate: '', visitTime: '' }); }}>
              Register Another Visitor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pre-register-layout">
      <div className="pre-register-bg"></div>
      <div className="pre-register-container">
        <div className="pre-register-brand">
          <span className="pre-register-logo">VP</span>
          <h1>VPass</h1>
          <p>Visitor Pre-Registration</p>
        </div>

        <div className="pre-register-card">
          <h2>Pre-Register Your Visit</h2>
          <p className="auth-desc">Fill in your details to register before your visit</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} placeholder="you@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <div className="input-with-icon">
                <FiBriefcase className="input-icon" />
                <input name="company" className="form-control" value={form.company} onChange={handleChange} placeholder="Your company" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Purpose of Visit</label>
              <input name="purpose" className="form-control" value={form.purpose} onChange={handleChange} placeholder="e.g. Meeting, Interview, Delivery" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">Visit Date</label>
                <input name="visitDate" type="date" className="form-control" value={form.visitDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Visit Time</label>
                <input name="visitTime" type="time" className="form-control" value={form.visitTime} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Pre-Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreRegisterPage;
