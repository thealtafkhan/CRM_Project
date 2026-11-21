import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [timeRange, setTimeRange] = useState('ThisMonth');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  if (loading && !kpis) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // 1. Lead Status Doughnut Chart (Cohesive 2-color shades)
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
          '#2563EB', // Primary Cobalt Blue
          '#60A5FA', // Light Cobalt
          '#10B981', // Functional Emerald
          '#94A3B8', // Neutral Slate
          '#0F172A', // Secondary Deep Slate
          '#EF4444'  // Functional Danger
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
        backgroundColor: '#2563EB',
        borderRadius: 6
      }
    ]
  };

  // 3. Monthly Sales Line Chart Data
  const monthlySalesData = {
    labels: charts?.monthlySales?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Closed Revenue ($)',
        data: charts?.monthlySales?.map(m => m.totalSales) || [],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2563EB',
        pointRadius: 4
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
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          usePointStyle: true
        }
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Top Header & Range Switcher */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Executive Sales Overview</h2>
          <p className="text-secondary small mb-0">Real-time performance indicators and revenue pipeline metrics.</p>
        </div>

        <div className="d-flex align-items-center bg-white p-1 rounded-3 border">
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

      {/* 8 Metric KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Total Customers</div>
              <div className="kpi-value">{kpis?.totalCustomers ?? 0}</div>
              <small className="badge-pill badge-primary-soft mt-1">Master Accounts</small>
            </div>
            <div className="kpi-icon-wrap">
              <i className="bi bi-building"></i>
            </div>
          </div>
        </div>

        {/* Total Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Captured Leads</div>
              <div className="kpi-value">{kpis?.totalLeads ?? 0}</div>
              <small className="badge-pill badge-secondary-soft mt-1">Acquired Prospects</small>
            </div>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
              <i className="bi bi-funnel"></i>
            </div>
          </div>
        </div>

        {/* Open Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Active Funnel Leads</div>
              <div className="kpi-value">{kpis?.openLeads ?? 0}</div>
              <small className="badge-pill badge-warning-soft mt-1">In Progress</small>
            </div>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>

        {/* Total Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Opportunities</div>
              <div className="kpi-value">{kpis?.totalOpportunities ?? 0}</div>
              <small className="badge-pill badge-primary-soft mt-1">{kpis?.openOpportunities ?? 0} Active</small>
            </div>
            <div className="kpi-icon-wrap">
              <i className="bi bi-briefcase"></i>
            </div>
          </div>
        </div>

        {/* Won Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Closed Deals (Won)</div>
              <div className="kpi-value">{kpis?.wonOpportunities ?? 0}</div>
              <small className="badge-pill badge-success-soft mt-1">Revenue Realized</small>
            </div>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <i className="bi bi-trophy"></i>
            </div>
          </div>
        </div>

        {/* Lost Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Closed Lost</div>
              <div className="kpi-value">{kpis?.lostOpportunities ?? 0}</div>
              <small className="badge-pill badge-danger-soft mt-1">Opportunities Lost</small>
            </div>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
              <i className="bi bi-x-circle"></i>
            </div>
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Unweighted Pipeline</div>
              <div className="kpi-value" style={{ color: '#2563EB' }}>
                ${(kpis?.totalPipelineValue || 0).toLocaleString()}
              </div>
              <small className="badge-pill badge-primary-soft mt-1">Gross Deal Potential</small>
            </div>
            <div className="kpi-icon-wrap">
              <i className="bi bi-currency-dollar"></i>
            </div>
          </div>
        </div>

        {/* Weighted Pipeline Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Weighted Forecast</div>
              <div className="kpi-value" style={{ color: '#0F172A' }}>
                ${(kpis?.totalWeightedPipeline || 0).toLocaleString()}
              </div>
              <small className="badge-pill badge-secondary-soft mt-1">Probability Derived</small>
            </div>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
              <i className="bi bi-calculator"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Chart.js Visual Analytics */}
      <div className="row g-4 mb-4">
        {/* Lead Status Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="crm-card p-3 h-100">
            <h6 className="fw-bold mb-3" style={{ color: '#0F172A' }}>
              <i className="bi bi-pie-chart-fill me-2 text-primary"></i>Lead Status Breakdown
            </h6>
            <div style={{ height: '260px' }}>
              <Doughnut data={leadStatusData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Opportunity Pipeline Stages */}
        <div className="col-12 col-lg-8">
          <div className="crm-card p-3 h-100">
            <h6 className="fw-bold mb-3" style={{ color: '#0F172A' }}>
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i>Pipeline Stage Valuation ($)
            </h6>
            <div style={{ height: '260px' }}>
              <Bar data={pipelineData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Monthly Sales Trend */}
        <div className="col-12">
          <div className="crm-card p-3">
            <h6 className="fw-bold mb-3" style={{ color: '#0F172A' }}>
              <i className="bi bi-graph-up me-2 text-primary"></i>Closed-Won Revenue Trajectory ({new Date().getFullYear()})
            </h6>
            <div style={{ height: '230px' }}>
              <Line data={monthlySalesData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
