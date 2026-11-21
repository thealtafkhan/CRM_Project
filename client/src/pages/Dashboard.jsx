import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [timeRange, setTimeRange] = useState('ThisMonth');
  const [loading, setLoading] = useState(true);

  // Supplemental role-specific data
  const [recentFollowUps, setRecentFollowUps] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);

  // Active view role (allows Admin/Manager to preview other role perspectives)
  const [activeRoleView, setActiveRoleView] = useState(user?.role || 'SalesExecutive');

  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(user.role);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/dashboard?timeRange=${timeRange}`);
      setKpis(res.data.kpis);
      setCharts(res.data.charts);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplementalData = async () => {
    try {
      // Common: follow-ups and opportunities
      const [followUpsRes, oppsRes] = await Promise.allSettled([
        api.get('/followups'),
        api.get('/opportunities')
      ]);

      if (followUpsRes.status === 'fulfilled' && followUpsRes.value.data?.data) {
        setRecentFollowUps(followUpsRes.value.data.data.slice(0, 5));
      }

      if (oppsRes.status === 'fulfilled' && oppsRes.value.data?.data) {
        setRecentOpportunities(oppsRes.value.data.data.slice(0, 5));
      }

      // Admin & Manager: audit logs
      if (isAdmin || isManager) {
        const auditRes = await api.get('/audit?limit=5').catch(() => null);
        if (auditRes?.data?.data) {
          setRecentAuditLogs(auditRes.data.data.slice(0, 5));
        }
      }

      // Admin only: users
      if (isAdmin) {
        const usersRes = await api.get('/users').catch(() => null);
        if (usersRes?.data?.data) {
          setTeamUsers(usersRes.data.data.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('Error fetching supplemental data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    fetchSupplementalData();
  }, [user]);

  if (loading && !kpis) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <div className="text-secondary fw-semibold">Loading CRM Intelligence...</div>
        </div>
      </div>
    );
  }

  // Modern Chart Color Theme
  const chartTheme = {
    primary: '#6366F1',
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    secondary: '#0F172A',
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
    slate: '#94A3B8',
    purple: '#8B5CF6'
  };

  // 1. Lead Status Doughnut Chart
  const leadStatusData = {
    labels: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
    datasets: [
      {
        data: [
          charts?.leadStatus?.New || 0,
          charts?.leadStatus?.Contacted || 0,
          charts?.leadStatus?.Qualified || 0,
          charts?.leadStatus?.Unqualified || 0,
          charts?.leadStatus?.Converted || 0,
          charts?.leadStatus?.Lost || 0
        ],
        backgroundColor: [
          chartTheme.primary,
          chartTheme.cyan,
          chartTheme.emerald,
          chartTheme.slate,
          chartTheme.purple,
          chartTheme.rose
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // 2. Opportunity Pipeline Bar Chart Data
  const pipelineData = {
    labels: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    datasets: [
      {
        label: 'Pipeline Value ($)',
        data: [
          charts?.opportunityPipeline?.Qualification?.amount || 0,
          charts?.opportunityPipeline?.Proposal?.amount || 0,
          charts?.opportunityPipeline?.Negotiation?.amount || 0,
          charts?.opportunityPipeline?.Won?.amount || 0,
          charts?.opportunityPipeline?.Lost?.amount || 0
        ],
        backgroundColor: [
          chartTheme.cyan,
          chartTheme.primary,
          chartTheme.purple,
          chartTheme.emerald,
          chartTheme.rose
        ],
        borderRadius: 8
      }
    ]
  };

  // 3. Monthly Sales Line Chart Data
  const monthlySalesData = {
    labels: charts?.monthlySales?.map((m) => m.month) || [],
    datasets: [
      {
        label: 'Closed Revenue ($)',
        data: charts?.monthlySales?.map((m) => m.totalSales) || [],
        borderColor: chartTheme.primary,
        backgroundColor: chartTheme.primaryLight,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartTheme.primary,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  /* --------------------------------------------------------------------------
     ADMIN VIEW: Command Center & Governance
     -------------------------------------------------------------------------- */
  const renderAdminDashboard = () => (
    <div>
      {/* Admin Hero Header */}
      <div className="dashboard-hero hero-admin">
        <div className="hero-glow-blob" style={{ background: '#6366F1', top: '-50px', right: '-50px' }}></div>
        <div className="d-flex flex-wrap justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-danger text-white px-2 py-1 small rounded-pill">
                <i className="bi bi-shield-lock me-1"></i> Root Administrator
              </span>
              <span className="badge bg-dark border border-secondary text-light px-2 py-1 small rounded-pill">
                Tenant: Acxiom Enterprise
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white">System Command Center</h2>
            <p className="text-white-50 small mb-0">Full organization visibility, user security policies, and revenue governance.</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/users" className="action-pill-btn">
              <i className="bi bi-person-plus-fill"></i> Add User
            </Link>
            <Link to="/audit" className="action-pill-btn">
              <i className="bi bi-shield-check"></i> Security Audit
            </Link>
            <Link to="/reports" className="action-pill-btn">
              <i className="bi bi-download"></i> Export Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Primary KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Gross Deal Potential</div>
              <div className="kpi-value text-primary">${(kpis?.totalPipelineValue || 0).toLocaleString()}</div>
              <small className="badge-pill badge-primary-soft mt-1">Full Organization</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#EEF2FF', color: '#6366F1' }}>
              <i className="bi bi-graph-up"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Weighted Forecast</div>
              <div className="kpi-value">${(kpis?.totalWeightedPipeline || 0).toLocaleString()}</div>
              <small className="badge-pill badge-purple-soft mt-1">Probability-Adjusted</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
              <i className="bi bi-calculator"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Customer Accounts</div>
              <div className="kpi-value">{kpis?.totalCustomers ?? 0}</div>
              <small className="badge-pill badge-success-soft mt-1">Master Records</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <i className="bi bi-buildings"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Opportunities Won</div>
              <div className="kpi-value text-success">{kpis?.wonOpportunities ?? 0}</div>
              <small className="badge-pill badge-info-soft mt-1">{kpis?.lostOpportunities ?? 0} Deals Lost</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#F0F9FF', color: '#0284C7' }}>
              <i className="bi bi-trophy-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Visual Analytics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="crm-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-bar-chart-fill me-2 text-primary"></i>Pipeline Stage Valuation ($)
              </h6>
              <span className="badge-pill badge-secondary-soft">Organization-wide</span>
            </div>
            <div style={{ height: '280px' }}>
              <Bar data={pipelineData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="crm-card p-3 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i>Lead Acquisition Funnel
            </h6>
            <div style={{ height: '280px' }}>
              <Doughnut data={leadStatusData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="crm-card p-3">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-graph-up-arrow me-2 text-primary"></i>Closed-Won Revenue Trajectory ({new Date().getFullYear()})
            </h6>
            <div style={{ height: '240px' }}>
              <Line data={monthlySalesData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Governance Stream: Security Logs & System Users */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="crm-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-shield-check me-2 text-danger"></i>Live Security & Audit Trail
                </h6>
                <small className="text-muted">Immutable ledger of user actions and sensitive operations</small>
              </div>
              <Link to="/audit" className="btn btn-sm btn-outline-secondary">View All</Link>
            </div>

            {recentAuditLogs.length === 0 ? (
              <div className="text-center py-4 text-muted small">No recent security events recorded.</div>
            ) : (
              <div className="list-group list-group-flush">
                {recentAuditLogs.map((log) => (
                  <div key={log._id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <div>
                      <div className="fw-semibold small text-dark">
                        <span className="badge-pill badge-secondary-soft me-2">{log.action}</span>
                        {log.entityName}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        by <span className="text-dark fw-medium">{log.userId?.name || 'System'}</span> • {new Date(log.timestamp).toLocaleString()}
                      </small>
                    </div>
                    <span className="badge-pill badge-primary-soft small">{log.entityId ? log.entityId.substring(0, 8) + '...' : 'System'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="crm-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-people-fill me-2 text-primary"></i>Active Team Members
                </h6>
                <small className="text-muted">System accounts and security roles</small>
              </div>
              <Link to="/users" className="btn btn-sm btn-outline-secondary">Manage</Link>
            </div>

            {teamUsers.length === 0 ? (
              <div className="text-center py-4 text-muted small">No active users retrieved.</div>
            ) : (
              <div>
                {teamUsers.map((u) => (
                  <div key={u._id} className="quick-task-item">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="fw-semibold small text-dark">{u.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{u.email}</div>
                      </div>
                    </div>
                    <span className={`badge-pill ${u.role === 'Admin' ? 'badge-danger-soft' : u.role === 'Manager' ? 'badge-primary-soft' : 'badge-success-soft'}`}>
                      {u.role}
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

  /* --------------------------------------------------------------------------
     SALES MANAGER VIEW: Team Pipeline & Performance Hub
     -------------------------------------------------------------------------- */
  const renderManagerDashboard = () => (
    <div>
      {/* Manager Hero Header */}
      <div className="dashboard-hero hero-manager">
        <div className="hero-glow-blob" style={{ background: '#10B981', top: '-50px', right: '-50px' }}></div>
        <div className="d-flex flex-wrap justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-light text-dark px-2 py-1 small rounded-pill fw-semibold">
                <i className="bi bi-person-badge me-1"></i> Sales Manager
              </span>
              <span className="badge bg-success border border-light text-white px-2 py-1 small rounded-pill">
                Pipeline Health: Strong
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white">Sales Management & Revenue Hub</h2>
            <p className="text-white-50 small mb-0">Team pipeline velocity, deal conversion rates, and quota attainment tracking.</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/opportunities" className="action-pill-btn">
              <i className="bi bi-briefcase-fill"></i> Review Pipeline
            </Link>
            <Link to="/leads" className="action-pill-btn">
              <i className="bi bi-funnel-fill"></i> Lead Allocations
            </Link>
            <Link to="/reports" className="action-pill-btn">
              <i className="bi bi-file-earmark-bar-graph"></i> Manager Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Manager KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Team Pipeline Potential</div>
              <div className="kpi-value text-primary">${(kpis?.totalPipelineValue || 0).toLocaleString()}</div>
              <small className="badge-pill badge-primary-soft mt-1">{kpis?.openOpportunities || 0} Open Deals</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
              <i className="bi bi-currency-dollar"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Weighted Revenue Forecast</div>
              <div className="kpi-value">${(kpis?.totalWeightedPipeline || 0).toLocaleString()}</div>
              <small className="badge-pill badge-success-soft mt-1">Expected Realization</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#EEF2FF', color: '#6366F1' }}>
              <i className="bi bi-pie-chart"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Closed-Won Deals</div>
              <div className="kpi-value text-success">{kpis?.wonOpportunities || 0}</div>
              <small className="badge-pill badge-success-soft mt-1">Realized Revenue</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <i className="bi bi-trophy"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Active Funnel Leads</div>
              <div className="kpi-value">{kpis?.openLeads || 0}</div>
              <small className="badge-pill badge-warning-soft mt-1">Requiring Qualification</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#F0F9FF', color: '#0284C7' }}>
              <i className="bi bi-funnel"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Charts & Deal Velocity */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="crm-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-bar-chart-line-fill me-2 text-success"></i>Pipeline Stages Valuation ($)
              </h6>
              <span className="badge-pill badge-success-soft">Team Pipeline</span>
            </div>
            <div style={{ height: '280px' }}>
              <Bar data={pipelineData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="crm-card p-3 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i>Lead Qualification Ratio
            </h6>
            <div style={{ height: '280px' }}>
              <Doughnut data={leadStatusData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="crm-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>High-Value Active Opportunities
                </h6>
                <small className="text-muted">Deals in Proposal & Negotiation stages</small>
              </div>
              <Link to="/opportunities" className="btn btn-sm btn-outline-secondary">Pipeline</Link>
            </div>

            {recentOpportunities.length === 0 ? (
              <div className="text-center py-4 text-muted small">No active opportunities in pipeline.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '0.72rem' }}>
                      <th>OPPORTUNITY</th>
                      <th>STAGE</th>
                      <th>VALUATION</th>
                      <th>WIN PROBABILITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOpportunities.map((opp) => (
                      <tr key={opp._id} style={{ fontSize: '0.85rem' }}>
                        <td className="fw-semibold text-dark">{opp.title}</td>
                        <td>
                          <span className="badge-pill badge-primary-soft">{opp.stage}</span>
                        </td>
                        <td className="fw-bold text-dark">${(opp.amount || 0).toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${opp.probability || 0}%` }}
                              ></div>
                            </div>
                            <small className="fw-semibold text-muted">{opp.probability || 0}%</small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="crm-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-calendar-check-fill me-2 text-primary"></i>Upcoming Client Follow-ups
                </h6>
                <small className="text-muted">Scheduled meetings and calls</small>
              </div>
              <Link to="/followups" className="btn btn-sm btn-outline-secondary">Schedule</Link>
            </div>

            {recentFollowUps.length === 0 ? (
              <div className="text-center py-4 text-muted small">No pending follow-ups scheduled.</div>
            ) : (
              <div>
                {recentFollowUps.map((fu) => (
                  <div key={fu._id} className="quick-task-item">
                    <div>
                      <div className="fw-semibold small text-dark">{fu.title || 'Client Follow-up'}</div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Due: {new Date(fu.followUpDate).toLocaleDateString()} • {fu.activityType || 'Call'}
                      </small>
                    </div>
                    <span className={`badge-pill ${fu.status === 'Completed' ? 'badge-success-soft' : 'badge-warning-soft'}`}>
                      {fu.status}
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

  /* --------------------------------------------------------------------------
     SALES EXECUTIVE VIEW: Action Cockpit & Priority Agenda
     -------------------------------------------------------------------------- */
  const renderExecutiveDashboard = () => (
    <div>
      {/* Sales Executive Hero Header */}
      <div className="dashboard-hero hero-sales">
        <div className="hero-glow-blob" style={{ background: '#38BDF8', top: '-50px', right: '-50px' }}></div>
        <div className="d-flex flex-wrap justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-light text-dark px-2 py-1 small rounded-pill fw-semibold">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Sales Executive Cockpit
              </span>
              <span className="badge bg-primary border border-light text-white px-2 py-1 small rounded-pill">
                Active Rep: {user?.name || 'Sales Representative'}
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white">Daily Action & Target Cockpit</h2>
            <p className="text-white-50 small mb-0">Prioritize today's follow-ups, progress active deals, and qualify inbound leads.</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/followups" className="action-pill-btn">
              <i className="bi bi-calendar-plus-fill"></i> New Follow-up
            </Link>
            <Link to="/leads" className="action-pill-btn">
              <i className="bi bi-funnel-fill"></i> View My Leads
            </Link>
            <Link to="/opportunities" className="action-pill-btn">
              <i className="bi bi-plus-circle-fill"></i> New Deal
            </Link>
          </div>
        </div>
      </div>

      {/* Sales Executive Action KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">My Open Deals</div>
              <div className="kpi-value text-primary">{kpis?.openOpportunities || 0}</div>
              <small className="badge-pill badge-primary-soft mt-1">In Active Pipeline</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#EEF2FF', color: '#6366F1' }}>
              <i className="bi bi-briefcase"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">My Pipeline Value</div>
              <div className="kpi-value">${(kpis?.totalPipelineValue || 0).toLocaleString()}</div>
              <small className="badge-pill badge-success-soft mt-1">${(kpis?.totalWeightedPipeline || 0).toLocaleString()} weighted</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <i className="bi bi-cash-stack"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">My Inbound Leads</div>
              <div className="kpi-value text-warning">{kpis?.openLeads || 0}</div>
              <small className="badge-pill badge-warning-soft mt-1">To Contact / Qualify</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <i className="bi bi-telephone-inbound"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">My Won Deals</div>
              <div className="kpi-value text-success">{kpis?.wonOpportunities || 0}</div>
              <small className="badge-pill badge-info-soft mt-1">Closed Realized</small>
            </div>
            <div className="kpi-icon-wrap" style={{ background: '#F0F9FF', color: '#0284C7' }}>
              <i className="bi bi-award-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Action Center: Today's Follow-up Agenda & Deals */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="crm-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-check2-circle me-2 text-primary"></i>My Priority Follow-up Tasks
                </h6>
                <small className="text-muted">Client calls, product demos & review meetings</small>
              </div>
              <Link to="/followups" className="btn btn-sm btn-primary">Open Calendar</Link>
            </div>

            {recentFollowUps.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <i className="bi bi-calendar2-check fs-1 text-muted d-block mb-2"></i>
                You're all caught up! No scheduled follow-ups pending.
              </div>
            ) : (
              <div>
                {recentFollowUps.map((fu) => (
                  <div key={fu._id} className="quick-task-item">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                        <i className={`bi ${fu.activityType === 'Call' ? 'bi-telephone' : fu.activityType === 'Meeting' ? 'bi-people' : 'bi-envelope'}`}></i>
                      </div>
                      <div>
                        <div className="fw-bold small text-dark">{fu.title}</div>
                        <small className="text-muted">
                          Scheduled: <span className="text-primary fw-medium">{new Date(fu.followUpDate).toLocaleDateString()}</span> • Priority: <span className="text-dark fw-medium">{fu.priority || 'Medium'}</span>
                        </small>
                      </div>
                    </div>
                    <Link to="/followups" className="btn btn-sm btn-outline-secondary">
                      Execute
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="crm-card p-4 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i>My Leads Funnel
            </h6>
            <div style={{ height: '240px' }}>
              <Doughnut data={leadStatusData} options={chartOptions} />
            </div>
            <div className="text-center mt-3 pt-3 border-top">
              <Link to="/leads" className="btn btn-sm btn-outline-primary w-100">
                <i className="bi bi-funnel me-1"></i> Open Leads Pipeline
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="crm-card p-3">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i>My Opportunity Stage Pipeline
            </h6>
            <div style={{ height: '230px' }}>
              <Bar data={pipelineData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Top Controls: Role Switcher Preview (for Admin/Manager) + Time Range Filters */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        {/* Left: Role Indicator & Perspective Selector */}
        <div className="d-flex align-items-center gap-2">
          {(isAdmin || isManager) && (
            <div className="d-flex align-items-center bg-white p-1 rounded-3 border shadow-sm">
              <span className="text-muted px-2 small fw-bold">VIEW AS:</span>
              <button
                type="button"
                className={`btn btn-sm ${activeRoleView === 'Admin' ? 'btn-primary' : 'btn-light bg-transparent text-secondary border-0'}`}
                onClick={() => setActiveRoleView('Admin')}
                style={{ fontWeight: 600, fontSize: '0.78rem' }}
              >
                Admin
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeRoleView === 'Manager' ? 'btn-primary' : 'btn-light bg-transparent text-secondary border-0'}`}
                onClick={() => setActiveRoleView('Manager')}
                style={{ fontWeight: 600, fontSize: '0.78rem' }}
              >
                Manager
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeRoleView === 'SalesExecutive' ? 'btn-primary' : 'btn-light bg-transparent text-secondary border-0'}`}
                onClick={() => setActiveRoleView('SalesExecutive')}
                style={{ fontWeight: 600, fontSize: '0.78rem' }}
              >
                Sales Rep
              </button>
            </div>
          )}
        </div>

        {/* Right: Date Range Filter */}
        <div className="d-flex align-items-center bg-white p-1 rounded-3 border shadow-sm">
          {['Today', 'ThisWeek', 'ThisMonth'].map((range) => (
            <button
              key={range}
              type="button"
              className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-light bg-transparent text-secondary border-0'}`}
              onClick={() => setTimeRange(range)}
              style={{ fontWeight: 600, fontSize: '0.8rem' }}
            >
              {range === 'Today' ? 'Today' : range === 'ThisWeek' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Render Role-Specific Tailored Dashboard */}
      {activeRoleView === 'Admin' && renderAdminDashboard()}
      {activeRoleView === 'Manager' && renderManagerDashboard()}
      {activeRoleView === 'SalesExecutive' && renderExecutiveDashboard()}
    </div>
  );
};

export default Dashboard;
