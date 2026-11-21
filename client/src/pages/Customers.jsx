import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Customers = () => {
  const { isAdmin, isManager } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let url = `/customers?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;

      const res = await api.get(url);
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        customerName: customer.customerName,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        status: customer.status || 'Active'
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        status: 'Active'
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer Name is required.';
    }

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, formData);
        Swal.fire({
          title: 'Updated',
          text: 'Customer account details updated.',
          icon: 'success',
          confirmButtonColor: '#2563EB'
        });
      } else {
        await api.post('/customers', formData);
        Swal.fire({
          title: 'Created',
          text: 'New Customer master record registered.',
          icon: 'success',
          confirmButtonColor: '#2563EB'
        });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save customer.';
      Swal.fire('Conflict', msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Deactivate Account?',
      text: `Are you sure you want to deactivate ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Deactivate'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/customers/${id}`);
        Swal.fire('Deactivated', 'Customer marked as Inactive.', 'success');
        fetchCustomers();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.detail || 'Failed to deactivate.', 'error');
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>Customer Directory</h2>
          <p className="text-secondary small mb-0">Authorized customer accounts and relational interaction logs.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg"></i>
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="crm-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by Name, Code, Email, Company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Account Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
          <div className="col-12 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-fill">Apply Filter</button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setSearch(''); setStatus(''); setPage(1); fetchCustomers(); }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="crm-table-container mb-4">
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
                <th>Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-secondary">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Fetching records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="badge-pill badge-secondary-soft font-monospace">{c.customerCode}</span>
                    </td>
                    <td>
                      <Link to={`/customers/${c._id}`} className="fw-semibold text-decoration-none" style={{ color: '#2563EB' }}>
                        {c.customerName}
                      </Link>
                    </td>
                    <td>{c.companyName || '—'}</td>
                    <td><small className="text-secondary">{c.email}</small></td>
                    <td><small className="font-monospace text-secondary">{c.phone}</small></td>
                    <td>
                      <span className={`badge-pill ${c.status === 'Active' ? 'badge-success-soft' : 'badge-secondary-soft'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td><small className="text-secondary">{c.assignedTo?.name || 'Unassigned'}</small></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/customers/${c._id}`} className="btn btn-outline-secondary" title="View 360">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button className="btn btn-outline-secondary" onClick={() => handleOpenModal(c)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        {(isAdmin || isManager) && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(c._id, c.customerName)}
                            title="Deactivate"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
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
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>
                  {editingCustomer ? `Edit Customer (${editingCustomer.customerCode})` : 'Create Customer Account'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Customer Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.customerName ? 'is-invalid' : ''}`}
                        placeholder="e.g. Acme Industrial Technologies"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                      {formErrors.customerName && <div className="invalid-feedback">{formErrors.customerName}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Company name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        placeholder="contact@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number (10 digits) <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
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

export default Customers;
