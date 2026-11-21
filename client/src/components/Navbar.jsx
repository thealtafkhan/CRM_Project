import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="badge-pill badge-purple-soft"><i className="bi bi-shield-lock-fill"></i> Admin</span>;
      case 'Manager':
        return <span className="badge-pill badge-primary-soft"><i className="bi bi-person-badge-fill"></i> Sales Manager</span>;
      case 'SalesExecutive':
        return <span className="badge-pill badge-success-soft"><i className="bi bi-lightning-charge-fill"></i> Sales Rep</span>;
      default:
        return <span className="badge-pill badge-secondary-soft">{role}</span>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg crm-navbar sticky-top">
      <div className="container-fluid px-3">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/dashboard">
          <div className="crm-brand-icon">
            <img src="/logo.svg" alt="ZenithCRM Logo" width="34" height="34" />
          </div>
          <div className="d-flex align-items-center">
            <span className="crm-brand-title">Zenith<span style={{ color: '#818CF8' }}>CRM</span></span>
            <span className="crm-brand-tag d-none d-sm-inline-block">Enterprise</span>
          </div>
        </Link>

        {/* User Pill & Sign Out */}
        <div className="d-flex align-items-center ms-auto gap-3">
          {user && (
            <>
              <div className="user-profile-pill d-none d-sm-flex">
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="d-flex flex-column text-start">
                  <span className="text-white fw-semibold small lh-1">{user.name}</span>
                  <span className="text-white-50" style={{ fontSize: '0.7rem' }}>{user.email}</span>
                </div>
                <div className="ms-1">{getRoleBadge(user.role)}</div>
              </div>

              <button
                onClick={logout}
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 py-1 px-3"
                style={{ borderRadius: '10px', fontSize: '0.825rem', borderColor: 'rgba(255,255,255,0.2)' }}
                title="Sign Out"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-md-inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
