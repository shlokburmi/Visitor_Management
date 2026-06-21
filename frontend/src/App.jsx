import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff';
import ReportsPage from './pages/admin/ReportsPage';

// Shared pages
import VisitorsPage from './pages/shared/VisitorsPage';
import AppointmentsPage from './pages/shared/AppointmentsPage';
import PassesPage from './pages/shared/PassesPage';
import CheckLogsPage from './pages/shared/CheckLogsPage';

// Security pages
import ScanPage from './pages/security/ScanPage';
import IssuePassPage from './pages/security/IssuePassPage';
import ActiveVisitorsPage from './pages/security/ActiveVisitorsPage';

// Host pages
import InviteVisitorPage from './pages/host/InviteVisitorPage';

// Visitor pages (public)
import PreRegisterPage from './pages/visitor/PreRegisterPage';

// Styles
import './styles/global.css';
import './styles/forms.css';

// Role-based route guard
const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/pre-register" element={<PreRegisterPage />} />

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard routes (protected) */}
          <Route element={<DashboardLayout />}>
            {/* Common dashboard — all roles */}
            <Route path="/dashboard" element={<AdminDashboard />} />

            {/* Admin only */}
            <Route path="/dashboard/staff" element={<RoleRoute roles={['admin']}><ManageStaff /></RoleRoute>} />
            <Route path="/dashboard/reports" element={<RoleRoute roles={['admin']}><ReportsPage /></RoleRoute>} />

            {/* Admin + Security */}
            <Route path="/dashboard/scan" element={<RoleRoute roles={['admin', 'security']}><ScanPage /></RoleRoute>} />
            <Route path="/dashboard/issue-pass" element={<RoleRoute roles={['admin', 'security']}><IssuePassPage /></RoleRoute>} />
            <Route path="/dashboard/active" element={<RoleRoute roles={['admin', 'security']}><ActiveVisitorsPage /></RoleRoute>} />

            {/* Admin + Host */}
            <Route path="/dashboard/invite" element={<RoleRoute roles={['admin', 'host']}><InviteVisitorPage /></RoleRoute>} />

            {/* All authenticated users */}
            <Route path="/dashboard/visitors" element={<VisitorsPage />} />
            <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
            <Route path="/dashboard/passes" element={<PassesPage />} />
            <Route path="/dashboard/checklogs" element={<CheckLogsPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--gray-200)', fontFamily: 'Outfit' }}>404</h1>
              <p style={{ color: 'var(--gray-500)' }}>Page not found</p>
              <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
            </div>
          } />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#1f2937',
            color: '#fff',
            fontSize: '0.875rem',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
