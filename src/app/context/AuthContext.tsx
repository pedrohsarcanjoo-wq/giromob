import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('@giromob:user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false); // Can be expanded for token validation

  const login = (token: string, u: User) => {
    localStorage.setItem('@giromob:token', token);
    localStorage.setItem('@giromob:user', JSON.stringify(u));
    setUser(u);
    toast.success(`Bem-vindo, ${u.name || u.email}!`);
  };

  const logout = () => {
    localStorage.removeItem('@giromob:token');
    localStorage.removeItem('@giromob:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
