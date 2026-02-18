import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../api/client';

interface User {
  _id: string;
  username: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('potrero_token');
        const userJson = await AsyncStorage.getItem('potrero_user');
        if (token && userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await api.post('/autenticacion/iniciar-sesion', { usernameOrEmail, password });
    await AsyncStorage.setItem('potrero_token', res.data.token);
    await AsyncStorage.setItem('potrero_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.post('/autenticacion/registro', { username, email, password });
    await AsyncStorage.setItem('potrero_token', res.data.token);
    await AsyncStorage.setItem('potrero_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('potrero_token');
    await AsyncStorage.removeItem('potrero_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
