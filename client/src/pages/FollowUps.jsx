import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    relatedType: 'Customer',
    customerId: '',
    leadId: '',
    followUpDate: '',
    followUpType: 'Call',
    subject: '',
    remarks: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      let url = `/followups?limit=50`;
      if (status) url += `&status=${status}`;
      if (isOverdue) url += `&isOverdue=true`;

      const res = await api.get(url);
      setFollowUps(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/leads?limit=100')
      ]);
      setCustomers(cRes.data.data);
      setLeads(lRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    fetchDependencies();
  }, [status, isOverdue]);

  const handleOpenModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    setFormData({
      relatedType: 'Customer',
      customerId: customers[0]?._id || '',
      leadId: leads[0]?._id || '',
      followUpDate: tomorrow.toISOString().slice(0, 16),
      followUpType: 'Call',
      subject: '',
      remarks: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.subject.trim()) {
      errors.subject = 'Follow-up Subject is required.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(formData.followUpDate);
    if (!formData.followUpDate || targetDate < today) {
      errors.followUpDate = 'Follow-up date cannot be earlier than today.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        subject: formData.subject,
        followUpType: formData.followUpType,
        followUpDate: formData.followUpDate,
        remarks: formData.remarks,
        customerId: formData.relatedType === 'Customer' ? formData.customerId : null,
        leadId: formData.relatedType === 'Lead' ? formData.leadId : null
      };

      await api.post('/followups', payload);
      Swal.fire({ title: 'Scheduled', text: 'Touchpoint reminder established.', icon: 'success', confirmButtonColor: '#2563EB' });
      setShowModal(false);
      fetchFollowUps();
    } catch (err) {
      Swal.fire('Validation Error', err.response?.data?.detail || 'Failed to schedule.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async (id) => {
    const { value: remarks } = await Swal.fire({
      title: 'Complete Follow-Up',
      input: 'textarea',
      inputLabel: 'Completion Remarks',
      inputPlaceholder: 'Enter interaction outcome...',
      showCancelButton: true,
      confirmButtonText: 'Mark Complete',
      confirmButtonColor: '#2563EB'
    });

    if (remarks !== undefined) {
      try {
        await api.put(`/followups/${id}`, {
          status: 'Completed',
          remarks: remarks || 'Completed successfully.'
        });
        Swal.fire('Complete', 'Follow-up marked as Completed.', 'success');
        fetchFollowUps();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.detail || 'Failed.', 'error');
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Follow-Up & Touchpoints</h2>
          <p className="text-secondary small mb-0">Scheduled client communications, overdue alerts, and task tracking.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleOpenModal}>
          <i className="bi bi-calendar-plus"></i>
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="crm-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${status === '' && !isOverdue ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setStatus(''); setIsOverdue(false); }}
          >
            All Follow-Ups
          </button>
          <button
            type="button"
            className={`btn btn-sm ${status === 'Planned' && !isOverdue ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setStatus('Planned'); setIsOverdue(false); }}
          >
            Planned / Upcoming
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isOverdue ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => { setStatus(''); setIsOverdue(true); }}
          >
            <i className="bi bi-exclamation-circle-fill me-1"></i> Overdue Tasks
          </button>
          <button
            type="button"
            className={`btn btn-sm ${status === 'Completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setStatus('Completed'); setIsOverdue(false); }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Scheduled Date</th>
                <th>Channel Type</th>
                <th>Subject & Agenda</th>
                <th>Target Contact</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Fetching follow-ups...
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No scheduled follow-up touchpoints found.</td>
                </tr>
              ) : (
                followUps.map((f) => {
                  const isPast = new Date(f.followUpDate) < new Date();
                  const isOverdueNow = isPast && f.status === 'Planned';

                  return (
                    <tr key={f._id} style={isOverdueNow ? { backgroundColor: '#FEF2F2' } : {}}>
                      <td>
                        <div className="fw-semibold">
                          {new Date(f.followUpDate).toLocaleDateString()}
                        </div>
                        <small className="text-muted">{new Date(f.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <span className="badge-pill badge-secondary-soft">
                          <i className={`bi ${f.followUpType === 'Call' ? 'bi-telephone' : f.followUpType === 'Meeting' ? 'bi-people' : f.followUpType === 'Email' ? 'bi-envelope' : 'bi-camera-video'} me-1 text-primary`}></i>
                          {f.followUpType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{f.subject}</div>
                        {f.remarks && <small className="text-muted">{f.remarks}</small>}
                      </td>
                      <td>
                        {f.customerId ? (
                          <div>
                            <span className="badge-pill badge-primary-soft me-1">Customer</span>
                            <span className="fw-semibold small">{f.customerId.customerName}</span>
                          </div>
                        ) : f.leadId ? (
                          <div>
                            <span className="badge-pill badge-secondary-soft me-1">Lead</span>
                            <span className="fw-semibold small">{f.leadId.leadName}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td><small className="text-secondary">{f.assignedTo?.name || 'Unassigned'}</small></td>
                      <td>
                        {isOverdueNow ? (
                          <span className="badge-pill badge-danger-soft fw-bold">OVERDUE</span>
                        ) : (
                          <span className={`badge-pill ${f.status === 'Completed' ? 'badge-success-soft' : 'badge-primary-soft'}`}>
                            {f.status}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        {f.status === 'Planned' && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleMarkComplete(f._id)}
                            title="Complete"
                          >
                            <i className="bi bi-check-lg me-1"></i> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>Schedule Follow-Up Touchpoint</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Link Touchpoint To:</label>
                    <div className="btn-group w-100">
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.relatedType === 'Customer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Customer' })}
                      >
                        Customer Account
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.relatedType === 'Lead' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Lead' })}
                      >
                        Lead Prospect
                      </button>
                    </div>
                  </div>

                  {formData.relatedType === 'Customer' ? (
                    <div className="mb-3">
                      <label className="form-label">Customer Account <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        required
                      >
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Lead Contact <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.leadId}
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                        required
                      >
                        {leads.map((l) => (
                          <option key={l._id} value={l._id}>{l.leadName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Channel</label>
                      <select
                        className="form-select"
                        value={formData.followUpType}
                        onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                      >
                        <option value="Call">Phone Call</option>
                        <option value="Meeting">Meeting</option>
                        <option value="VideoConference">Video Call</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Date & Time <span className="text-danger">*</span></label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.followUpDate ? 'is-invalid' : ''}`}
                        min={new Date().toISOString().slice(0, 16)}
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                        required
                      />
                      {formErrors.followUpDate && <div className="invalid-feedback">{formErrors.followUpDate}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Subject <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.subject ? 'is-invalid' : ''}`}
                      placeholder="e.g. Follow-up on pricing proposal"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                    {formErrors.subject && <div className="invalid-feedback">{formErrors.subject}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Follow-Up'}
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

export default FollowUps;
