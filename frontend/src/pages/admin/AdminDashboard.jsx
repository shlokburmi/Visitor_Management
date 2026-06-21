import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../api';
import { FiUsers, FiUserCheck, FiCreditCard, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, activityRes, trendRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getVisitorTrend(7),
      ]);
      setStats(statsRes.data.data);
      setActivity(activityRes.data.data);
      setTrend(trendRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { icon: FiUsers, label: "Today's Visitors", value: stats.todayVisitors, color: '#6366f1', bg: '#eef2ff' },
    { icon: FiUserCheck, label: 'Currently Inside', value: stats.activeVisitors, color: '#22c55e', bg: '#f0fdf4' },
    { icon: FiCreditCard, label: 'Active Passes', value: stats.activePasses, color: '#f59e0b', bg: '#fffbeb' },
    { icon: FiCalendar, label: 'Pending Appointments', value: stats.pendingAppointments, color: '#ef4444', bg: '#fef2f2' },
    { icon: FiUsers, label: 'Total Visitors', value: stats.totalVisitors, color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: FiUserCheck, label: 'Staff Members', value: stats.totalStaff, color: '#06b6d4', bg: '#ecfeff' },
  ] : [];

  // Chart configuration
  const chartData = {
    labels: trend.map(t => {
      const d = new Date(t.date);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }),
    datasets: [{
      label: 'Visitors',
      data: trend.map(t => t.count),
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      borderWidth: 2.5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#d1d5db',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 },
      },
    },
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="stats-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }}></div>
              <div>
                <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 4 }}></div>
                <div className="skeleton" style={{ width: 100, height: 14 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]}. Here's your overview.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon />
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{card.value}</h3>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">
              <FiTrendingUp style={{ marginRight: 8, color: 'var(--primary-500)' }} />
              Visitor Trend (7 Days)
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card activity-card">
          <div className="card-header">
            <h3 className="card-title">
              <FiClock style={{ marginRight: 8, color: 'var(--accent-500)' }} />
              Recent Activity
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {activity.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No recent activity</p>
              </div>
            ) : (
              <div className="activity-list">
                {activity.map((log, idx) => (
                  <div key={idx} className="activity-item">
                    <div className={`activity-dot ${log.status === 'checked_in' ? 'dot-success' : 'dot-gray'}`}></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{log.visitor?.name || 'Unknown'}</strong>
                        {' '}
                        {log.status === 'checked_in' ? 'checked in' : 'checked out'}
                      </p>
                      <p className="activity-meta">
                        {log.visitor?.company && `${log.visitor.company} · `}
                        {log.checkInTime && new Date(log.checkInTime).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`badge ${log.status === 'checked_in' ? 'badge-success' : 'badge-gray'}`}>
                      {log.status === 'checked_in' ? 'In' : 'Out'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
