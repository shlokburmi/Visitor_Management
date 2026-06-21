import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthLayout.css';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-bg-pattern"></div>
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-logo-icon">VP</span>
          </div>
          <h1 className="auth-title">VPass</h1>
          <p className="auth-subtitle">Visitor Pass Management System</p>
        </div>
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
