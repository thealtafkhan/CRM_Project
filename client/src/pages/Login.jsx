import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please provide your Username/Email and Password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid login credentials or server unreachable.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="crm-card p-4 p-sm-5" style={{ maxWidth: '440px', width: '100%', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08)' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white p-3 rounded-3 mb-3 shadow-sm" style={{ width: '52px', height: '52px' }}>
            <i className="bi bi-intersect fs-3"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Acxiom<span style={{ color: '#2563EB' }}>CRM</span></h3>
          <p className="text-muted small">Enterprise Customer Relationship & Sales Management</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-2 mb-3 small border-0" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email or Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="name@acxiomcrm.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-key text-muted"></i></span>
              <input
                type="password"
                className="form-control border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing In...
              </>
            ) : (
              <>
                Sign In to CRM Portal
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="border-top mt-4 pt-3">
          <small className="text-muted d-block text-center mb-2 fw-semibold">Quick Role Switcher:</small>
          <div className="d-flex justify-content-between gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
              onClick={() => fillCredentials('admin@acxiomcrm.com', 'Admin@12345')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
              onClick={() => fillCredentials('manager@acxiomcrm.com', 'Manager@12345')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
              onClick={() => fillCredentials('sales@acxiomcrm.com', 'Sales@12345')}
            >
              Sales Rep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
