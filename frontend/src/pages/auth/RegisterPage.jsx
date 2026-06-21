import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiBriefcase } from 'react-icons/fi';

const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Account created! Welcome, ${user.name}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Create Account</h2>
      <p className="auth-desc">Register as an employee to invite visitors</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <div className="input-with-icon">
            <FiUser className="input-icon" />
            <input id="reg-name" type="text" name="name" className="form-control" placeholder="John Doe" value={formData.name} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" />
            <input id="reg-email" type="email" name="email" className="form-control" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <div className="input-with-icon">
            <FiLock className="input-icon" />
            <input id="reg-password" type="password" name="password" className="form-control" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
          <div className="input-with-icon">
            <FiPhone className="input-icon" />
            <input id="reg-phone" type="tel" name="phone" className="form-control" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-dept">Department (optional)</label>
          <div className="input-with-icon">
            <FiBriefcase className="input-icon" />
            <input id="reg-dept" type="text" name="department" className="form-control" placeholder="e.g. Engineering" value={formData.department} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </>
  );
};

export default RegisterPage;
