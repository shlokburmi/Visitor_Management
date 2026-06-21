import { useState } from 'react';
import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiCalendar, FiCreditCard, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiCamera, FiUserPlus, FiCheckCircle,
  FiShield, FiClipboard, FiChevronRight
} from 'react-icons/fi';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based navigation items
  const getNavItems = () => {
    const items = [];

    // Common dashboard
    items.push({ path: '/dashboard', icon: FiHome, label: 'Dashboard' });

    if (user?.role === 'admin') {
      items.push({ path: '/dashboard/staff', icon: FiUsers, label: 'Manage Staff' });
      items.push({ path: '/dashboard/visitors', icon: FiUserPlus, label: 'Visitors' });
      items.push({ path: '/dashboard/appointments', icon: FiCalendar, label: 'Appointments' });
      items.push({ path: '/dashboard/passes', icon: FiCreditCard, label: 'Passes' });
      items.push({ path: '/dashboard/checklogs', icon: FiCheckCircle, label: 'Check Logs' });
      items.push({ path: '/dashboard/reports', icon: FiBarChart2, label: 'Reports' });
    }

    if (user?.role === 'security') {
      items.push({ path: '/dashboard/scan', icon: FiCamera, label: 'Scan QR' });
      items.push({ path: '/dashboard/issue-pass', icon: FiCreditCard, label: 'Issue Pass' });
      items.push({ path: '/dashboard/active', icon: FiCheckCircle, label: 'Active Visitors' });
      items.push({ path: '/dashboard/checklogs', icon: FiClipboard, label: 'Check Logs' });
      items.push({ path: '/dashboard/visitors', icon: FiUsers, label: 'Visitors' });
    }

    if (user?.role === 'host') {
      items.push({ path: '/dashboard/invite', icon: FiUserPlus, label: 'Invite Visitor' });
      items.push({ path: '/dashboard/appointments', icon: FiCalendar, label: 'My Appointments' });
      items.push({ path: '/dashboard/visitors', icon: FiUsers, label: 'Visitors' });
    }

    return items;
  };

  const navItems = getNavItems();
  const roleLabels = { admin: 'Administrator', security: 'Security Desk', host: 'Employee' };

  const handleLogout = () => {
    logout();
  };

  // Get breadcrumb from current path
  const getBreadcrumb = () => {
    const current = navItems.find(item => location.pathname === item.path);
    return current?.label || 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">VP</span>
            <div>
              <h2 className="sidebar-title">VPass</h2>
              <p className="sidebar-role">{roleLabels[user?.role] || user?.role}</p>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
              <FiChevronRight className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <div className="breadcrumb">
              <FiShield className="breadcrumb-icon" />
              <span>{getBreadcrumb()}</span>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="top-bar-user">
              <span className="top-bar-greeting">Hi, {user?.name?.split(' ')[0]}</span>
              <div className="top-bar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
