/**
 * AUTH CONTEXT
 * ============
 * Manages authentication state across the app.
 * - Stores user and token
 * - Provides login, register, logout
 * - Listens for auth:logout (from 401 interceptor) to clear state
 * - Token is stored in localStorage (see api/axios.js)
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api.js';
import { setToken, removeToken, getToken } from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getCurrentUser();
      setUser(res?.data ?? res);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: u, accessToken } = res?.data ?? res;
    setToken(accessToken);
    setUser(u);
    return u;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      removeToken();
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
