// ============================================================
// Campusly — Auth Context
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '../types';
import * as api from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState(!!api.getToken()); // Loading if we have a stored token
  const [error, setError] = useState<string | null>(null);

  // On mount, if we have a stored token, validate it by fetching /users/me
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api.fetchMe()
      .then(({ user: u }) => {
        if (!cancelled) {
          setUser({
            id: u.id,
            email: u.email,
            fullName: u.fullName,
            role: u.role as UserRole,
            department: u.department || null,
            avatarUrl: u.avatarUrl || null,
          });
        }
      })
      .catch(() => {
        // Token invalid/expired — clear
        if (!cancelled) {
          api.setToken(null);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        role: res.user.role as UserRole,
        department: res.user.department || null,
        avatarUrl: res.user.avatarUrl || null,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, role?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.register({ email, password, fullName, role });
      api.setToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        role: res.user.role as UserRole,
        department: res.user.department || null,
        avatarUrl: res.user.avatarUrl || null,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
