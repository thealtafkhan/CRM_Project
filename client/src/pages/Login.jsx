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
        background: 'radial-gradient(ellipse at 80% 20%, rgba(0, 255, 102, 0.12), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(16, 185, 129, 0.08), transparent 50%), #080B0E'
      }}
    >
      <div
        className="card p-4 p-sm-5 position-relative"
        style={{
          maxWidth: '460px',
          width: '100%',
          borderRadius: '24px',
          background: 'rgba(14, 19, 24, 0.96)',
          border: '1px solid rgba(0, 255, 102, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 255, 102, 0.12)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-2 mb-3">
            <img src="/logo.svg" alt="CRM Logo" width="56" height="56" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 102, 0.5))' }} />
          </div>
          <h3 className="fw-bolder mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            CRM
          </h3>
          <p className="text-muted small mb-0">Sales & Relationship Platform</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-3 mb-4 small rounded-3 border-0" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#FDA4AF', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <i className="bi bi-exclamation-octagon-fill flex-shrink-0 me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light fw-semibold">Email or Username</label>
            <div className="input-group">
              <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: '#090D11', borderColor: 'var(--crm-border)', borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-envelope text-primary"></i>
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
              <label className="form-label text-light fw-semibold mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: '#090D11', borderColor: 'var(--crm-border)', borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-key text-primary"></i>
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
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center"
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

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--crm-border)' }}>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <span className="badge-pill badge-primary-soft" style={{ fontSize: '0.68rem' }}>1-Click Demo Login</span>
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem', backgroundColor: '#090D11', borderColor: 'var(--crm-border)' }}
              onClick={() => fillCredentials('admin@acxiomcrm.com', 'Admin@12345')}
            >
              <i className="bi bi-shield-lock-fill text-primary mb-1"></i>
              <span className="text-light">Admin</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem', backgroundColor: '#090D11', borderColor: 'var(--crm-border)' }}
              onClick={() => fillCredentials('manager@acxiomcrm.com', 'Manager@12345')}
            >
              <i className="bi bi-person-badge-fill text-primary mb-1"></i>
              <span className="text-light">Manager</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold py-2 d-flex flex-column align-items-center"
              style={{ borderRadius: '10px', fontSize: '0.78rem', backgroundColor: '#090D11', borderColor: 'var(--crm-border)' }}
              onClick={() => fillCredentials('sales@acxiomcrm.com', 'Sales@12345')}
            >
              <i className="bi bi-lightning-charge-fill text-primary mb-1"></i>
              <span className="text-light">Sales Rep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
