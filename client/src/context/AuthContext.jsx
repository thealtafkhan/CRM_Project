import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('acxiom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('acxiom_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('acxiom_user', JSON.stringify(res.data.user));
        } catch (err) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('acxiom_user');
          localStorage.removeItem('acxiom_token');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('acxiom_token', newToken);
    localStorage.setItem('acxiom_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('acxiom_token');
      localStorage.removeItem('acxiom_user');
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isSalesExecutive = user?.role === 'SalesExecutive';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isManager, isSalesExecutive }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
