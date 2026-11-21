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
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 position-relative px-3 py-5"
      style={{
        background: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.12), transparent 50%), #0B0F19'
      }}
    >
      <div
        className="card border-0 p-4 p-sm-5 position-relative"
        style={{
          maxWidth: '460px',
          width: '100%',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-2 mb-3">
            <img src="/logo.svg" alt="CRM Logo" width="56" height="56" style={{ filter: 'drop-shadow(0 6px 12px rgba(99, 102, 241, 0.35))' }} />
          </div>
          <h3 className="fw-bolder mb-1" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            CRM
          </h3>
          <p className="text-muted small mb-0">Enterprise Sales & Relationship Platform</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-3 mb-4 small rounded-3 border-0" style={{ backgroundColor: '#FFF1F2', color: '#9F1239' }}>
            <i className="bi bi-exclamation-octagon-fill flex-shrink-0 me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Email or Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                style={{ borderRadius: '0 10px 10px 0' }}
                placeholder="name@crm.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-dark fw-semibold mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0"
                style={{ borderRadius: '0 10px 10px 0' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
            style={{ borderRadius: '12px' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Workspace
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="border-top mt-4 pt-3">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <span className="badge-pill badge-primary-soft" style={{ fontSize: '0.68rem' }}>1-Click Demo Login</span>
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem' }}
              onClick={() => fillCredentials('admin@acxiomcrm.com', 'Admin@12345')}
            >
              <i className="bi bi-shield-lock-fill text-purple mb-1" style={{ color: '#8B5CF6' }}></i>
              Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem' }}
              onClick={() => fillCredentials('manager@acxiomcrm.com', 'Manager@12345')}
            >
              <i className="bi bi-person-badge-fill text-primary mb-1" style={{ color: '#6366F1' }}></i>
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem' }}
              onClick={() => fillCredentials('sales@acxiomcrm.com', 'Sales@12345')}
            >
              <i className="bi bi-lightning-charge-fill text-success mb-1" style={{ color: '#10B981' }}></i>
              Sales Rep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
