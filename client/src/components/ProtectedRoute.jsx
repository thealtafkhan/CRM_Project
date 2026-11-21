import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading ZenithCRM...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-sm">
          <h4 className="alert-heading"><i className="bi bi-shield-lock-fill me-2"></i>Access Denied (403 Forbidden)</h4>
          <p>Your current role (<strong>{user.role}</strong>) does not have authorization to view this resource.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
