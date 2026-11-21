import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="badge-pill badge-danger-soft">Admin</span>;
      case 'Manager':
        return <span className="badge-pill badge-primary-soft">Sales Manager</span>;
      case 'SalesExecutive':
        return <span className="badge-pill badge-success-soft">Sales Exec</span>;
      default:
        return <span className="badge-pill badge-secondary-soft">{role}</span>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg crm-navbar sticky-top">
      <div className="container-fluid px-3">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-white text-decoration-none" to="/dashboard">
          <div className="crm-brand-icon">
            <i className="bi bi-intersect"></i>
          </div>
          <div>
            <span className="fw-bold fs-5 tracking-tight">Acxiom<span style={{ color: '#60A5FA' }}>CRM</span></span>
          </div>
        </Link>

        {/* User Pill & Sign Out */}
        <div className="d-flex align-items-center ms-auto gap-3">
          {user && (
            <>
              <div className="user-profile-pill d-none d-sm-flex">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {user.name.charAt(0)}
                </div>
                <div className="d-flex flex-column text-start">
                  <span className="text-white fw-semibold small lh-1">{user.name}</span>
                  <span className="text-white-50" style={{ fontSize: '0.7rem' }}>{user.email}</span>
                </div>
                <div className="ms-1">{getRoleBadge(user.role)}</div>
              </div>

              <button
                onClick={logout}
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 py-1 px-3"
                style={{ borderRadius: '8px', fontSize: '0.825rem', borderColor: 'rgba(255,255,255,0.2)' }}
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
