import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('greenlife_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('greenlife_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('greenlife_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem('greenlife_token');
    const hasUser = !!localStorage.getItem('greenlife_user');
    return hasToken && !hasUser;
  });

  useEffect(() => {
    // Run verification only on initial mount if token exists
    const tokenFromStorage = localStorage.getItem('greenlife_token');
    if (!tokenFromStorage) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const verifyAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (!isCancelled) {
          setUser(res.data);
          localStorage.setItem('greenlife_user', JSON.stringify(res.data));
        }
      } catch (err: any) {
        if (!isCancelled && err.response?.status === 401) {
          logout();
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('greenlife_token', access_token);
    localStorage.setItem('greenlife_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    setIsLoading(false);
  };

  const signup = async (data: any) => {
    const res = await authApi.signup(data);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('greenlife_token', access_token);
    localStorage.setItem('greenlife_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('greenlife_token');
    localStorage.removeItem('greenlife_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
