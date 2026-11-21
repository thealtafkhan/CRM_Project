import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SalesExecutive',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'SalesExecutive',
        isActive: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'User Name is required.';

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email.';
    }

    if (!editingUser) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!formData.password) {
        errors.password = 'Password is required.';
      } else if (!passwordRegex.test(formData.password)) {
        errors.password = 'Password must be min 8 chars with 1 uppercase, 1 lowercase, 1 number, and 1 symbol.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        });
        Swal.fire({ title: 'Updated', text: 'User profile updated.', icon: 'success', confirmButtonColor: '#2563EB' });
      } else {
        await api.post('/users', formData);
        Swal.fire({ title: 'Created', text: 'User account provisioned.', icon: 'success', confirmButtonColor: '#2563EB' });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'Failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlockAccount = async (id, name) => {
    try {
      await api.put(`/users/${id}`, { resetLockout: true });
      Swal.fire({ title: 'Unlocked', text: `Account for ${name} unlocked.`, icon: 'success', confirmButtonColor: '#2563EB' });
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to unlock.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      Swal.fire('Updated', `Account status updated.`, 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>User Governance</h2>
          <p className="text-secondary small mb-0">Administer personnel roles, authentication lockout states, and system access.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
          <i className="bi bi-person-plus-fill"></i>
          <span>Provision User</span>
        </button>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email Address</th>
                <th>Primary Role</th>
                <th>State</th>
                <th>Failed Attempts</th>
                <th>Security Lockout</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary">
                    <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                    Fetching personnel...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isLocked = u.lockoutEnd && new Date(u.lockoutEnd) > new Date();

                  return (
                    <tr key={u._id}>
                      <td className="fw-semibold text-dark">{u.name}</td>
                      <td><small className="text-secondary">{u.email}</small></td>
                      <td>
                        <span className={`badge-pill ${u.role === 'Admin' ? 'badge-danger-soft' : u.role === 'Manager' ? 'badge-primary-soft' : 'badge-secondary-soft'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${u.isActive ? 'badge-success-soft' : 'badge-secondary-soft'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${u.failedLoginCount >= 5 ? 'badge-danger-soft' : 'badge-secondary-soft'}`}>
                          {u.failedLoginCount || 0} / 5
                        </span>
                      </td>
                      <td>
                        {isLocked ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge-pill badge-danger-soft fw-bold">LOCKED</span>
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleUnlockAccount(u._id, u.name)}
                            >
                              Unlock
                            </button>
                          </div>
                        ) : (
                          <span className="badge-pill badge-success-soft">Normal</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-secondary" onClick={() => handleOpenModal(u)} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className={`btn ${u.isActive ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${u.isActive ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <h5 className="modal-title fw-bold" style={{ color: '#0F172A' }}>
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Provision User Account'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      placeholder="user@acxiomcrm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>

                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Password <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Aa1@••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                      <small className="text-muted d-block mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 symbol.</small>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Role Assignment <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="SalesExecutive">Sales Executive</option>
                      <option value="Manager">Sales Manager</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  <div className="form-check form-switch mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeCheck"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="activeCheck">
                      Account Enabled & Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingUser ? 'Update User' : 'Save User'}
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

export default Users;
