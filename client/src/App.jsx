import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Leads from './pages/Leads';
import Opportunities from './pages/Opportunities';
import FollowUps from './pages/FollowUps';
import Activities from './pages/Activities';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 bg-light overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes for All Roles */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/followups" element={<FollowUps />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Admin Only Governance Route */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/users" element={<Users />} />
            </Route>

            {/* Admin & Manager Audit Route */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
              <Route path="/audit" element={<AuditLogs />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
