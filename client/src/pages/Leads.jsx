import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Leads = () => {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    leadName: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    expectedValue: 0,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Conversion modal state
  const [convertModal, setConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [convertData, setConvertData] = useState({
    opportunityName: '',
    amount: 0,
    expectedCloseDate: ''
  });
  const [converting, setConverting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = `/leads?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      if (priority) url += `&priority=${priority}`;

      const res = await api.get(url);
      setLeads(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, status, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        leadName: lead.leadName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName || '',
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        expectedValue: lead.expectedValue,
        notes: lead.notes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        leadName: '',
        email: '',
        phone: '',
        companyName: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        expectedValue: 0,
        notes: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.leadName.trim()) errors.leadName = 'Lead Name is required.';

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid 10-digit phone number.';
    }

    if (formData.expectedValue < 0) {
      errors.expectedValue = 'Expected value cannot be negative.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
        Swal.fire({ title: 'Updated', text: 'Lead details updated.', icon: 'success', confirmButtonColor: '#2563EB' });
      } else {
        await api.post('/leads', formData);
        Swal.fire({ title: 'Captured', text: 'New prospect recorded.', icon: 'success', confirmButtonColor: '#2563EB' });
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      Swal.fire('Validation Error', err.response?.data?.detail || 'Failed to save lead.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenConvert = (lead) => {
    setConvertingLead(lead);
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    setConvertData({
      opportunityName: `${lead.companyName || lead.leadName} - Deal`,
      amount: lead.expectedValue > 0 ? lead.expectedValue : 15000,
      expectedCloseDate: thirtyDaysAhead.toISOString().split('T')[0]
    });
    setConvertModal(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setConverting(true);
    try {
      const res = await api.post(`/leads/${convertingLead._id}/convert`, convertData);
      Swal.fire({
        title: 'Lead Converted!',
        html: `Customer Account and Deal created successfully.<br><strong>Customer Code:</strong> ${res.data.data.customerCode}`,
        icon: 'success',
        confirmButtonColor: '#2563EB'
      });
      setConvertModal(false);
      fetchLeads();
    } catch (err) {
      Swal.fire('Conversion Error', err.response?.data?.detail || 'Failed to convert lead.', 'error');
    } finally {
      setConverting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'New': return <span className="badge-pill badge-primary-soft">New</span>;
      case 'Contacted': return <span className="badge-pill badge-warning-soft">Contacted</span>;
      case 'Qualified': return <span className="badge-pill badge-success-soft">Qualified</span>;
      case 'Unqualified': return <span className="badge-pill badge-secondary-soft">Unqualified</span>;
      case 'Converted': return <span className="badge-pill badge-primary-soft" style={{ fontWeight: 700 }}>Converted</span>;
      case 'Lost': return <span className="badge-pill badge-danger-soft">Lost</span>;
      default: return <span className="badge-pill badge-secondary-soft">{st}</span>;
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Lead Pipeline Management</h2>
          <p className="text-secondary small mb-0">Capture, qualify, and convert prospective accounts into closed business.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
          <i className="bi bi-funnel-fill"></i>
          <span>Capture Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="crm-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search Lead, Company, Email, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select className="form-select" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-fill">Filter</button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setSearch(''); setStatus(''); setPriority(''); setPage(1); fetchLeads(); }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="crm-table-container mb-4">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Lead Code</th>
                <th>Prospect Contact</th>
                <th>Company</th>
                <th>Acquisition Source</th>
                <th>Expected Value</th>
                <th>Funnel Status</th>
                <th>Priority</th>
                <th>Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-secondary">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Fetching leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <span className="badge-pill badge-secondary-soft font-monospace">{lead.leadCode}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{lead.leadName}</div>
                      <small className="text-secondary">{lead.email} | {lead.phone}</small>
                    </td>
                    <td>{lead.companyName || '—'}</td>
                    <td><small className="text-secondary">{lead.source}</small></td>
                    <td className="fw-bold" style={{ color: '#2563EB' }}>
                      ${lead.expectedValue?.toLocaleString()}
                    </td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td>
                      <span className={`badge-pill ${lead.priority === 'Urgent' ? 'badge-danger-soft' : lead.priority === 'High' ? 'badge-warning-soft' : 'badge-primary-soft'}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td><small className="text-secondary">{lead.assignedTo?.name || 'Unassigned'}</small></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {lead.status !== 'Converted' && (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenConvert(lead)}
                            title="Convert to Customer & Deal"
                          >
                            <i className="bi bi-arrow-repeat me-1"></i> Convert
                          </button>
                        )}
                        <button className="btn btn-outline-secondary" onClick={() => handleOpenModal(lead)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 d-flex justify-content-between align-items-center border-top">
            <span className="small text-muted">Page {page} of {totalPages}</span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Capture Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>
                  {editingLead ? `Edit Lead (${editingLead.leadCode})` : 'Capture New Prospect'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Contact Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.leadName ? 'is-invalid' : ''}`}
                        value={formData.leadName}
                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      />
                      {formErrors.leadName && <div className="invalid-feedback">{formErrors.leadName}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Organization Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone (10 digits) <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Acquisition Source</label>
                      <select
                        className="form-select"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      >
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Partner">Partner</option>
                        <option value="Campaign">Campaign</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Expected Value ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.expectedValue}
                        onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingLead ? 'Update Lead' : 'Save Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {convertModal && convertingLead && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>
                  <i className="bi bi-arrow-repeat text-primary me-2"></i>Convert Lead to Customer & Deal
                </h5>
                <button type="button" className="btn-close" onClick={() => setConvertModal(false)}></button>
              </div>
              <form onSubmit={handleConvertSubmit}>
                <div className="modal-body p-4">
                  <p className="small text-secondary mb-3">
                    Converts prospect into an active <strong>Customer Account</strong> and schedules a new <strong>Opportunity Deal</strong>.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Deal Opportunity Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={convertData.opportunityName}
                      onChange={(e) => setConvertData({ ...convertData, opportunityName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Deal Amount ($) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      required
                      value={convertData.amount}
                      onChange={(e) => setConvertData({ ...convertData, amount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Expected Close Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={convertData.expectedCloseDate}
                      onChange={(e) => setConvertData({ ...convertData, expectedCloseDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setConvertModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={converting}>
                    {converting ? 'Converting...' : 'Execute Conversion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
