import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; data?: { token: string; user: User } }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; data?: { token: string; user: User } }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('localhub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem('localhub_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('localhub_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await api.login({ email, password });
    setIsLoading(false);
    if (res.success && res.data) {
      localStorage.setItem('localhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, data: res.data };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data: any) => {
    setIsLoading(true);
    const res = await api.register(data);
    setIsLoading(false);
    if (res.success && res.data) {
      localStorage.setItem('localhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, data: res.data };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('localhub_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
