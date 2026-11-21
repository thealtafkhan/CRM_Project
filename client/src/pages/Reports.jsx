import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('pipeline');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (reportType) => {
    try {
      setLoading(true);
      if (reportType === 'pipeline') {
        const res = await api.get('/reports/pipeline');
        setReportData(res.data);
      } else if (reportType === 'customers') {
        const res = await api.get('/customers?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'leads') {
        const res = await api.get('/leads?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'opportunities') {
        const res = await api.get('/opportunities?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'followups') {
        const res = await api.get('/followups?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'activities') {
        const res = await api.get('/activities?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'conversion') {
        const [lRes, oRes] = await Promise.all([
          api.get('/leads?limit=200'),
          api.get('/opportunities?limit=200')
        ]);
        const allLeads = lRes.data.data;
        const convertedCount = allLeads.filter(l => l.status === 'Converted').length;
        const totalLeads = allLeads.length;
        const convRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;

        const allOpps = oRes.data.data;
        const wonCount = allOpps.filter(o => o.status === 'Won').length;
        const lostCount = allOpps.filter(o => o.status === 'Lost').length;
        const totalOpps = allOpps.length;
        const winRate = (wonCount + lostCount) > 0 ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1) : 0;

        setReportData({
          totalLeads,
          convertedCount,
          convRate,
          totalOpps,
          wonCount,
          lostCount,
          winRate
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'customers') {
      csvContent += 'Customer Code,Name,Company,Email,Phone,Status,Created Date\n';
      reportData.forEach(c => {
        csvContent += `"${c.customerCode}","${c.customerName}","${c.companyName || ''}","${c.email}","${c.phone}","${c.status}","${new Date(c.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (activeReport === 'leads') {
      csvContent += 'Lead Code,Name,Company,Source,Expected Value,Status,Priority\n';
      reportData.forEach(l => {
        csvContent += `"${l.leadCode}","${l.leadName}","${l.companyName || ''}","${l.source}","${l.expectedValue}","${l.status}","${l.priority}"\n`;
      });
    } else if (activeReport === 'opportunities') {
      csvContent += 'Deal Name,Amount,Stage,Probability,Weighted Value,Expected Close Date,Status\n';
      reportData.forEach(o => {
        const weighted = (o.amount * o.probability) / 100;
        csvContent += `"${o.opportunityName}","${o.amount}","${o.stage}","${o.probability}","${weighted}","${new Date(o.expectedCloseDate).toLocaleDateString()}","${o.status}"\n`;
      });
    } else if (activeReport === 'pipeline') {
      csvContent += 'Stage,Deal Count,Total Pipeline Amount ($),Weighted Amount ($)\n';
      reportData.stageSummary?.forEach(s => {
        csvContent += `"${s._id}","${s.totalDeals}","${s.totalAmount}","${s.weightedAmount}"\n`;
      });
    } else {
      csvContent += JSON.stringify(reportData);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ZenithCRM_${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Reports & Analytics</h2>
          <p className="text-secondary small mb-0">Cross-cutting revenue pipeline, conversion analytics, and historical audits.</p>
        </div>
        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={exportToCSV}>
          <i className="bi bi-download"></i>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="crm-card p-2 mb-4">
        <div className="d-flex flex-wrap gap-1">
          {[
            { id: 'pipeline', label: 'Pipeline Forecast' },
            { id: 'customers', label: 'Customer Directory' },
            { id: 'leads', label: 'Lead Funnel' },
            { id: 'opportunities', label: 'Opportunities' },
            { id: 'followups', label: 'Touchpoint Schedule' },
            { id: 'conversion', label: 'Conversion & Win/Loss' },
            { id: 'activities', label: 'Activity Feed' }
          ].map(r => (
            <button
              key={r.id}
              className={`btn btn-sm ${activeReport === r.id ? 'btn-primary' : 'btn-light bg-transparent text-secondary border-0'}`}
              style={{ fontWeight: 600, borderRadius: '6px' }}
              onClick={() => setActiveReport(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Container */}
      <div className="crm-table-container p-4">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <span className="spinner-border text-primary me-2"></span>
            Generating report dataset...
          </div>
        ) : (
          <div>
            {/* 1. PIPELINE REPORT */}
            {activeReport === 'pipeline' && reportData && (
              <div>
                <h5 className="fw-bold mb-3" style={{ color: '#0F172A' }}>Stage-Wise Pipeline Breakdown</h5>
                <div className="table-responsive mb-4">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Pipeline Stage</th>
                        <th>Deal Count</th>
                        <th>Unweighted Pipeline Value ($)</th>
                        <th>Weighted Forecast Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.stageSummary?.map(s => (
                        <tr key={s._id}>
                          <td><span className="badge-pill badge-primary-soft">{s._id}</span></td>
                          <td className="fw-semibold">{s.totalDeals}</td>
                          <td className="fw-bold">${s.totalAmount?.toLocaleString()}</td>
                          <td className="fw-bold text-primary">
                            ${Math.round(s.weightedAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h5 className="fw-bold mb-3 mt-4" style={{ color: '#0F172A' }}>Owner-Wise Allocation</h5>
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Sales Representative</th>
                        <th>Deals Count</th>
                        <th>Total Pipeline Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.ownerSummary?.map(o => (
                        <tr key={o.ownerId || 'unassigned'}>
                          <td className="fw-semibold text-dark">{o.ownerName || 'Unassigned'}</td>
                          <td>{o.totalDeals}</td>
                          <td className="fw-bold">${o.totalAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. CUSTOMER REPORT */}
            {activeReport === 'customers' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Customer Code</th>
                      <th>Account Name</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(c => (
                      <tr key={c._id}>
                        <td><span className="badge-pill badge-secondary-soft font-monospace">{c.customerCode}</span></td>
                        <td className="fw-semibold text-dark">{c.customerName}</td>
                        <td>{c.companyName || '—'}</td>
                        <td><small className="text-secondary">{c.email}</small></td>
                        <td><small className="text-secondary">{c.phone}</small></td>
                        <td><span className={`badge-pill ${c.status === 'Active' ? 'badge-success-soft' : 'badge-secondary-soft'}`}>{c.status}</span></td>
                        <td><small className="text-secondary">{new Date(c.createdAt).toLocaleDateString()}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. LEAD REPORT */}
            {activeReport === 'leads' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead Code</th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Source</th>
                      <th>Expected Value</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(l => (
                      <tr key={l._id}>
                        <td><span className="badge-pill badge-secondary-soft font-monospace">{l.leadCode}</span></td>
                        <td className="fw-semibold text-dark">{l.leadName}</td>
                        <td>{l.companyName || '—'}</td>
                        <td>{l.source}</td>
                        <td className="fw-bold" style={{ color: '#2563EB' }}>${l.expectedValue?.toLocaleString()}</td>
                        <td><span className="badge-pill badge-primary-soft">{l.status}</span></td>
                        <td><span className="badge-pill badge-secondary-soft">{l.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. OPPORTUNITY REPORT */}
            {activeReport === 'opportunities' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Opportunity Name</th>
                      <th>Account</th>
                      <th>Amount ($)</th>
                      <th>Stage</th>
                      <th>Probability</th>
                      <th>Weighted Value ($)</th>
                      <th>Expected Close</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(o => (
                      <tr key={o._id}>
                        <td className="fw-semibold text-dark">{o.opportunityName}</td>
                        <td>{o.customerId?.customerName || '—'}</td>
                        <td className="fw-bold">${o.amount?.toLocaleString()}</td>
                        <td><span className="badge-pill badge-primary-soft">{o.stage}</span></td>
                        <td>{o.probability}%</td>
                        <td className="fw-bold text-primary">
                          ${((o.amount * o.probability) / 100).toLocaleString()}
                        </td>
                        <td><small className="text-secondary">{new Date(o.expectedCloseDate).toLocaleDateString()}</small></td>
                        <td><span className="badge-pill badge-secondary-soft">{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. FOLLOW-UP REPORT */}
            {activeReport === 'followups' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Channel</th>
                      <th>Subject</th>
                      <th>Remarks</th>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(f => (
                      <tr key={f._id}>
                        <td>{new Date(f.followUpDate).toLocaleString()}</td>
                        <td><span className="badge-pill badge-secondary-soft">{f.followUpType}</span></td>
                        <td className="fw-semibold text-dark">{f.subject}</td>
                        <td><small className="text-secondary">{f.remarks || '—'}</small></td>
                        <td>{f.assignedTo?.name || 'Unassigned'}</td>
                        <td><span className="badge-pill badge-primary-soft">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. CONVERSION REPORT */}
            {activeReport === 'conversion' && reportData && (
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="crm-card p-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#0F172A' }}>Lead Conversion Ratio</h5>
                    <div className="display-4 fw-bold text-primary mb-2">{reportData.convRate}%</div>
                    <p className="text-secondary small">
                      <strong>{reportData.convertedCount}</strong> leads successfully converted out of <strong>{reportData.totalLeads}</strong> total prospects captured.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="crm-card p-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#0F172A' }}>Opportunity Win Ratio</h5>
                    <div className="display-4 fw-bold text-success mb-2">{reportData.winRate}%</div>
                    <p className="text-secondary small">
                      <strong>{reportData.wonCount}</strong> deals Closed-Won vs. <strong>{reportData.lostCount}</strong> deals Closed-Lost.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. ACTIVITY REPORT */}
            {activeReport === 'activities' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Channel</th>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.activityDate).toLocaleString()}</td>
                        <td><span className="badge-pill badge-secondary-soft">{a.activityType}</span></td>
                        <td className="fw-semibold text-dark">{a.subject}</td>
                        <td><small className="text-secondary">{a.description || '—'}</small></td>
                        <td>{a.assignedTo?.name || 'User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
