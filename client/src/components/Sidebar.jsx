import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin, isManager } = useAuth();

  return (
    <div className="crm-sidebar d-none d-md-block">
      <div className="crm-sidebar-header">Core Operations</div>
      <nav className="nav flex-column mb-3">
        <NavLink to="/dashboard" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-building"></i>
          <span>Customers</span>
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-funnel-fill"></i>
          <span>Leads Pipeline</span>
        </NavLink>
        <NavLink to="/opportunities" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-briefcase-fill"></i>
          <span>Opportunities</span>
        </NavLink>
        <NavLink to="/followups" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-calendar2-check-fill"></i>
          <span>Follow-Ups</span>
        </NavLink>
        <NavLink to="/activities" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-clock-history"></i>
          <span>Activity Log</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bar-chart-fill"></i>
          <span>Reports & Analytics</span>
        </NavLink>
      </nav>

      {(isAdmin || isManager) && (
        <>
          <div className="crm-sidebar-header mt-3">Administration</div>
          <nav className="nav flex-column">
            {isAdmin && (
              <NavLink to="/users" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-shield-person"></i>
                <span>User Governance</span>
              </NavLink>
            )}
            <NavLink to="/audit" className={({ isActive }) => `crm-nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-journal-code"></i>
              <span>Audit Trail</span>
            </NavLink>
          </nav>
        </>
      )}
    </div>
  );
};

export default Sidebar;
