import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState('');

  // Log Activity Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    activityType: 'Call',
    subject: '',
    description: '',
    relatedType: 'Customer',
    customerId: '',
    leadId: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = '/activities?limit=50';
      if (activityType) url += `&activityType=${activityType}`;
      const res = await api.get(url);
      setActivities(res.data.data);
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
    fetchActivities();
    fetchDependencies();
  }, [activityType]);

  const handleOpenModal = () => {
    setFormData({
      activityType: 'Call',
      subject: '',
      description: '',
      relatedType: 'Customer',
      customerId: customers[0]?._id || '',
      leadId: leads[0]?._id || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      Swal.fire('Validation Error', 'Subject is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        activityType: formData.activityType,
        subject: formData.subject,
        description: formData.description,
        customerId: formData.relatedType === 'Customer' ? formData.customerId : null,
        leadId: formData.relatedType === 'Lead' ? formData.leadId : null
      };

      await api.post('/activities', payload);
      Swal.fire({ title: 'Logged', text: 'Activity logged into history.', icon: 'success', confirmButtonColor: '#2563EB' });
      setShowModal(false);
      fetchActivities();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'Failed to log activity.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <i className="bi bi-telephone-fill text-primary"></i>;
      case 'Meeting': return <i className="bi bi-people-fill text-primary"></i>;
      case 'Email': return <i className="bi bi-envelope-fill text-primary"></i>;
      case 'Task': return <i className="bi bi-check2-square text-primary"></i>;
      default: return <i className="bi bi-clock-history text-primary"></i>;
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Activity Log</h2>
          <p className="text-secondary small mb-0">Omnichannel history of customer conversations, meetings, and sales tasks.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleOpenModal}>
          <i className="bi bi-plus-lg"></i>
          <span>Log Activity</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="crm-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          {['', 'Call', 'Meeting', 'Email', 'Task'].map((type) => (
            <button
              key={type}
              type="button"
              className={`btn btn-sm ${activityType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActivityType(type)}
            >
              {type === '' ? 'All Channels' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Subject & Description</th>
                <th>Relational Target</th>
                <th>Logged By</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Fetching activities...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No sales activities logged.</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act._id}>
                    <td>
                      <span className="badge-pill badge-primary-soft">
                        {getActivityIcon(act.activityType)} <span className="ms-1">{act.activityType}</span>
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{act.subject}</div>
                      {act.description && <small className="text-secondary d-block">{act.description}</small>}
                    </td>
                    <td>
                      {act.customerId ? (
                        <span className="fw-semibold small" style={{ color: '#2563EB' }}>{act.customerId.customerName}</span>
                      ) : act.leadId ? (
                        <span className="fw-semibold small text-dark">{act.leadId.leadName}</span>
                      ) : '—'}
                    </td>
                    <td><small className="text-secondary">{act.assignedTo?.name || 'User'}</small></td>
                    <td>
                      <div className="small fw-semibold">{new Date(act.activityDate).toLocaleDateString()}</div>
                      <small className="text-muted">{new Date(act.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td><span className="badge-pill badge-success-soft">{act.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>Log Sales Interaction</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Channel Type</label>
                    <select
                      className="form-select"
                      value={formData.activityType}
                      onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email Communication</option>
                      <option value="Task">Task Execution</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Link To:</label>
                    <div className="btn-group w-100">
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.relatedType === 'Customer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Customer' })}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.relatedType === 'Lead' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Lead' })}
                      >
                        Lead
                      </button>
                    </div>
                  </div>

                  {formData.relatedType === 'Customer' ? (
                    <div className="mb-3">
                      <label className="form-label">Select Customer</label>
                      <select
                        className="form-select"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Select Lead</label>
                      <select
                        className="form-select"
                        value={formData.leadId}
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      >
                        {leads.map((l) => (
                          <option key={l._id} value={l._id}>{l.leadName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Subject <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Conducted commercial discussion with VP"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Discussion Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Key takeaways..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Log Activity'}
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

export default Activities;
