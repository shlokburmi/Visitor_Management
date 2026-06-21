import { useState, useEffect } from 'react';
import { visitorsAPI, passesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCreditCard, FiSearch, FiUser, FiPlus } from 'react-icons/fi';
import '../admin/Dashboard.css';

const IssuePassPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: find/create visitor, 2: issue pass
  const [searchPhone, setSearchPhone] = useState('');
  const [visitor, setVisitor] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showNewVisitor, setShowNewVisitor] = useState(false);
  const [visitorForm, setVisitorForm] = useState({ name: '', phone: '', email: '', company: '', idType: 'other', idNumber: '' });
  const [passForm, setPassForm] = useState({ hostId: '', validHours: 8, type: 'single' });
  const [issuing, setIssuing] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearching(true);
    try {
      const res = await visitorsAPI.getAll({ search: searchPhone.trim() });
      if (res.data.data.length > 0) {
        setVisitor(res.data.data[0]);
        setStep(2);
        toast.success('Visitor found');
      } else {
        toast('No visitor found. Create a new record.', { icon: '📝' });
        setShowNewVisitor(true);
        setVisitorForm(prev => ({ ...prev, phone: searchPhone.trim() }));
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(visitorForm).forEach(([k, v]) => { if (v) formData.append(k, v); });
      const res = await visitorsAPI.create(formData);
      setVisitor(res.data.data);
      setShowNewVisitor(false);
      setStep(2);
      toast.success('Visitor registered');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create visitor');
    }
  };

  const handleIssuePass = async (e) => {
    e.preventDefault();
    if (!visitor) return;
    setIssuing(true);
    try {
      const validUntil = new Date(Date.now() + parseInt(passForm.validHours) * 60 * 60 * 1000);
      const res = await passesAPI.issue({
        visitorId: visitor._id,
        hostId: passForm.hostId || user._id,
        validUntil: validUntil.toISOString(),
        type: passForm.type,
      });
      toast.success(`Pass ${res.data.data.passCode} issued!`);
      // Reset
      setStep(1);
      setVisitor(null);
      setSearchPhone('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue pass');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Visitor Pass</h1>
          <p className="page-subtitle">Register walk-in visitors and issue passes</p>
        </div>
      </div>

      {/* Step 1: Find or create visitor */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiSearch style={{ marginRight: 8 }} />Step 1: Find or Register Visitor</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <input className="form-control" placeholder="Search by phone, name, or email..." value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {showNewVisitor && (
              <div style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '1rem' }}>Register New Visitor</h4>
                <form onSubmit={handleCreateVisitor}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={visitorForm.name} onChange={(e) => setVisitorForm({...visitorForm, name: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={visitorForm.phone} onChange={(e) => setVisitorForm({...visitorForm, phone: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={visitorForm.email} onChange={(e) => setVisitorForm({...visitorForm, email: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={visitorForm.company} onChange={(e) => setVisitorForm({...visitorForm, company: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">ID Type</label>
                      <select className="form-control form-select" value={visitorForm.idType} onChange={(e) => setVisitorForm({...visitorForm, idType: e.target.value})}>
                        <option value="aadhar">Aadhar</option><option value="passport">Passport</option><option value="driving_license">Driving License</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">ID Number</label><input className="form-control" value={visitorForm.idNumber} onChange={(e) => setVisitorForm({...visitorForm, idNumber: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3"><FiPlus /> Register & Continue</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Issue pass */}
      {step === 2 && visitor && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiCreditCard style={{ marginRight: 8 }} />Step 2: Issue Pass</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => { setStep(1); setVisitor(null); }}>← Back</button>
          </div>
          <div className="card-body">
            <div style={{ background: 'var(--primary-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <p className="text-sm text-secondary">Issuing pass for:</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{visitor.name}</p>
              <p className="text-sm text-muted">{visitor.phone} · {visitor.company || 'Walk-in'}</p>
            </div>

            <form onSubmit={handleIssuePass}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pass Duration</label>
                  <select className="form-control form-select" value={passForm.validHours} onChange={(e) => setPassForm({...passForm, validHours: e.target.value})}>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours (Full Day)</option>
                    <option value="24">24 Hours</option>
                    <option value="48">2 Days</option>
                    <option value="168">1 Week</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pass Type</label>
                  <select className="form-control form-select" value={passForm.type} onChange={(e) => setPassForm({...passForm, type: e.target.value})}>
                    <option value="single">Single Visit</option>
                    <option value="multi_day">Multi-Day</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg mt-4" disabled={issuing} style={{ width: '100%' }}>
                <FiCreditCard /> {issuing ? 'Issuing Pass...' : 'Issue Pass & Generate QR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuePassPage;
