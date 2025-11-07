import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAccessToken(token);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.accessToken);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', { name, email, password });
      setUser(res.data.user);
      setToken(res.data.accessToken);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.response?.data?.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, signup, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
